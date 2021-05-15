import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, StyleRules, TextField, Theme, Typography, withStyles, withWidth } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ChangeEvent, FocusEvent, FormEvent, MouseEvent, ReactNode } from 'react';
import { DialogComponent } from '../../../../../../components/base/dialog-component';
import { DialogCloseButton } from '../../../../../../components/dialog/dialog-close-button.component';
import { InputFieldContainer } from '../../../../../../components/input/input-field-container.component';
import { GameServantConstants } from '../../../../../../constants';
import { GameServantService } from '../../../../../../services/data/game/game-servant.service';
import { DialogComponentProps, GameServant, MasterServant, MasterServantBondLevel, Nullable, ReadonlyRecord, WithStylesProps } from '../../../../../../types';
import { MasterServantSkillLevel } from '../../../../../../types/data/master/servant/master-servant-skill-level.type';
import { FormUtils } from '../../../../../../utils/form.utils';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { MasterServantEditDialogAutocomplete } from './master-servant-edit-dialog-autocomplete.component';

type FormData = {
    gameId: number;
    np: number;
    level: string | number;
    ascension: string | number;
    fouAtk: string | number;
    fouHp: string | number;
    skill1: string | number;
    skill2: string | number;
    skill3: string | number;
    bond: string | number;
    unlockedCostumes: Record<number, boolean>;
};

type ModalData = {
    masterServant: Omit<MasterServant, 'instanceId'>;
    bond: MasterServantBondLevel | undefined,
    costumes: Array<number>
};

type RenderedProps = {
    disableServantSelect?: boolean;
    dialogTitle?: string;
    submitButtonLabel?: string;
};

type Props = {
    /**
     * The master servant to edit. If not provided, the dialog will instantiate a
     * new servant.
     */
    masterServant?: MasterServant;
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    unlockedCostumes: Array<number>;
} & 
RenderedProps & 
WithStylesProps &
Omit<DialogComponentProps<ModalData>, 'keepMounted' | 'onExited' | 'PaperProps'>;

type State = {
    formData: FormData;
};

const style = (theme: Theme) => ({
    form: {
        paddingTop: theme.spacing(4)
    },
    inputFieldGroup: {
        display: 'flex',
        flexWrap: 'nowrap',
        [theme.breakpoints.down('xs')]: {
            flexWrap: 'wrap'
        }
    },
    inputFieldContainer: {
        flex: 1,
        padding: theme.spacing(0, 2),
        [theme.breakpoints.down('xs')]: {
            flex: '100% !important'
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantEditDialog'
};

export const MasterServantEditDialog = withWidth()(withStyles(style, styleOptions)(class extends DialogComponent<Props, State, ModalData> {

    private readonly _formId = 'servant-form';

    private _gameServantList: ReadonlyArray<Readonly<GameServant>> = [];

    private _gameServantMap: ReadonlyRecord<number, Readonly<GameServant>> = {};

    private _propsSnapshot: Nullable<RenderedProps>;

    constructor(props: Props) {
        super(props);

        const {  masterServant } = props;

        this.state = {
            formData: this._convertToFormData(masterServant)
        };

        this._renderForm = this._renderForm.bind(this);
        this._renderServantNameField = this._renderServantNameField.bind(this);
        this._handleOnDialogExited = this._handleOnDialogExited.bind(this);
        this._handleSelectedServantChange = this._handleSelectedServantChange.bind(this);
        this._handleSelectInputChange = this._handleSelectInputChange.bind(this);
        this._handleInputChange = this._handleInputChange.bind(this);
        this._handleAscensionInputChange = this._handleAscensionInputChange.bind(this);
        this._handleLevelInputBlur = this._handleLevelInputBlur.bind(this);
        this._handleFouInputBlur = this._handleFouInputBlur.bind(this);
        this._submit = this._submit.bind(this);
        this._cancel = this._cancel.bind(this);
    }

    componentDidMount(): void {
        GameServantService.getServants().then(gameServantList => {
            this._gameServantList = gameServantList;
            this.forceUpdate();
        });
        GameServantService.getServantsMap().then(gameServantMap => {
            this._gameServantMap = gameServantMap;
            this.forceUpdate();
        });
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        if (!nextProps.open && this.props.open) {
            const {
                disableServantSelect,
                dialogTitle,
                submitButtonLabel
            } = this.props;

            this._propsSnapshot = {
                disableServantSelect,
                dialogTitle,
                submitButtonLabel
            };
        }
        return super.shouldComponentUpdate(nextProps, nextState);
    }

    componentDidUpdate(prevProps: Props): void {
        const { masterServant, open } = this.props;
        if (masterServant !== prevProps.masterServant || (open && !prevProps.open)) {
            const formData = this._convertToFormData(masterServant);
            this.setState({ formData });
        }
    }

    render(): ReactNode {

        const {
            classes,
            disableServantSelect,
            dialogTitle,
            submitButtonLabel,
            masterServant,
            ...dialogProps
        } = {
            ...this.props,
            ...this._propsSnapshot
        };

        const { 
            fullScreen, 
            closeIconEnabled, 
            actionButtonVariant 
        } = this._computeFullScreenProps();

        return (
            <Dialog
                {...dialogProps}
                PaperProps={{ style: { width: 600 } }}
                fullScreen={fullScreen}
                keepMounted={false}
                onExited={this._handleOnDialogExited}
            >
                <Typography component={'div'}>
                    <DialogTitle>
                        {dialogTitle}
                        {closeIconEnabled && <DialogCloseButton onClick={this._cancel}/>}
                    </DialogTitle>
                    <DialogContent>
                        {this._renderForm()}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant={actionButtonVariant}
                            color="secondary"
                            onClick={this._cancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={actionButtonVariant}
                            color="primary"
                            form={this._formId}
                            type="submit"
                        >
                            {submitButtonLabel || 'Submit'}
                        </Button>
                    </DialogActions>
                </Typography>
            </Dialog>
        );
    }

    private _renderForm(): ReactNode {
        const { classes } = this.props;
        const { formData } = this.state;
        return (
            <form 
                className={classes.form}
                id={this._formId}
                noValidate
                onSubmit={this._submit}
            >
                <div className={classes.inputFieldGroup}>
                    <InputFieldContainer className={classes.inputFieldContainer} flex="75%">
                        {this._renderServantNameField()}
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer} flex="25%">
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel htmlFor="np">NP Level</InputLabel>
                            <Select
                                native
                                id="np"
                                name="np"
                                label="NP Level"
                                value={formData.np}
                                onChange={this._handleSelectInputChange}
                            >
                                {GameServantConstants.NoblePhantasmLevels.map(level => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </InputFieldContainer>
                </div>
                <div className={classes.inputFieldGroup}>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Servant Level"
                            name="level"
                            type="number"
                            inputProps={{
                                step: 1,
                                min: GameServantConstants.MinLevel,
                                max: GameServantConstants.MaxLevel
                            }}
                            value={formData.level}
                            onChange={this._handleInputChange}
                            onBlur={this._handleLevelInputBlur}
                        />
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel htmlFor="ascension">Ascension</InputLabel>
                            <Select
                                native
                                id="ascension"
                                name="ascension"
                                label="Ascension"
                                value={formData.ascension}
                                onChange={this._handleAscensionInputChange}
                            >
                                {GameServantConstants.AscensionLevels.map(level => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="HP Fou"
                            name="fouHp"
                            type="number"
                            inputProps={{
                                step: this._getFouInputStepSize(formData.fouHp),
                                min: GameServantConstants.MinFou,
                                max: GameServantConstants.MaxFou
                            }}
                            value={formData.fouHp}
                            onChange={this._handleInputChange}
                            onBlur={this._handleFouInputBlur}
                        />
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Atk. Fou"
                            name="fouAtk"
                            type="number"
                            inputProps={{
                                step: this._getFouInputStepSize(formData.fouAtk),
                                min: GameServantConstants.MinFou,
                                max: GameServantConstants.MaxFou
                            }}
                            value={formData.fouAtk}
                            onChange={this._handleInputChange}
                            onBlur={this._handleFouInputBlur}
                        />
                    </InputFieldContainer>
                </div>
                <div className={classes.inputFieldGroup}>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel htmlFor="skill1">Skill 1</InputLabel>
                            <Select
                                native
                                id="skill1"
                                name="skill1"
                                label="Skill 1"
                                value={formData.skill1}
                                onChange={this._handleSelectInputChange}
                            >
                                {GameServantConstants.SkillLevels.map(level => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel htmlFor="skill2">Skill 2</InputLabel>
                            <Select
                                native
                                id="skill2"
                                name="skill2"
                                label="Skill 2"
                                value={formData.skill2}
                                onChange={this._handleSelectInputChange}
                            >
                                <option>{'\u2014'}</option> {/* Blank option */}
                                {GameServantConstants.SkillLevels.map(level => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel htmlFor="skill3">Skill 3</InputLabel>
                            <Select
                                native
                                id="skill3"
                                name="skill3"
                                label="Skill 3"
                                value={formData.skill3}
                                onChange={this._handleSelectInputChange}
                            >
                                <option>{'\u2014'}</option> {/* Blank option */}
                                {GameServantConstants.SkillLevels.map(level => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel htmlFor="bond">Bond</InputLabel>
                            <Select
                                native
                                id="bond"
                                name="bond"
                                label="Bond"
                                value={formData.bond}
                                onChange={this._handleSelectInputChange}
                            >
                                <option>{/* Blank option */}</option>
                                {GameServantConstants.BondLevels.map(level => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </Select>
                        </FormControl>
                    </InputFieldContainer>
                </div>
            </form>
        );
    }

    private _renderServantNameField(): ReactNode {
        const { formData } = this.state;
        const { disableServantSelect } = this._propsSnapshot || this.props;
        const servant = this._gameServantMap[formData.gameId];
        if (disableServantSelect) {
            return (
                <TextField
                    variant="outlined"
                    fullWidth
                    label="Servant"
                    value={servant.name}
                    disabled
                />
            );
        }
        return (
            <MasterServantEditDialogAutocomplete 
                servantList={this._gameServantList}
                selectedServant={servant}
                onChange={this._handleSelectedServantChange}
            />
        );
    }

    private _handleOnDialogExited(): void {
        this._propsSnapshot = null;
    }

    /**
     * Calculates the step size for the Fou number input fields based on the
     * current value of the field.
     */
    private _getFouInputStepSize(value: string | number | undefined): number {
        value = Number(value);
        if (!value || value < GameServantConstants.MaxFou / 2) {
            return 10;
        }
        return 20;
    }

    private _handleSelectedServantChange(event: ChangeEvent<{}>, value: GameServant): void {
        const { formData } = this.state;
        const gameId =  value._id;
        if (formData.gameId !== gameId) {
            const { bondLevels } = this.props;
            const servant = this._gameServantMap[gameId];
            formData.gameId = gameId;
            formData.bond = bondLevels[gameId] ?? '';
            formData.unlockedCostumes = this._generateUnlockedCostumesMap(servant);
            this.forceUpdate();
        }
    }

    private _handleSelectInputChange(event: ChangeEvent<{ name?: string; value: any }>): void {
        const { formData } = this.state;
        const { name, value } = event.target;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        FormUtils.assignValue(formData, name!!, value);
        this.forceUpdate();
    }

    private _handleInputChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const { formData } = this.state;
        const { name, value } = event.target;
        FormUtils.assignValue(formData, name, value);
        this.forceUpdate();
    }

    private _handleAscensionInputChange(event: ChangeEvent<{ name?: string; value: any }>): void {
        const { formData } = this.state;
        const servant = this._gameServantMap[formData.gameId];
        const { value } = event.target;
        const level = MasterServantUtils.roundToNearestValidLevel(Number(value), Number(formData.level), servant);
        formData.level = level;
        formData.ascension = value;
        this.forceUpdate();
    }

    private _handleLevelInputBlur(event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const { formData } = this.state;
        const servant = this._gameServantMap[formData.gameId];
        const { value } = event.target;
        const level = FormUtils.transformInputToInteger(value, GameServantConstants.MinLevel, GameServantConstants.MaxLevel) || 1;
        const ascension = MasterServantUtils.roundToNearestValidAscensionLevel(level, Number(formData.ascension), servant);
        formData.level = level;
        formData.ascension = ascension;
        this.forceUpdate();
    }

    private _handleFouInputBlur(event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const { formData } = this.state;
        const { name, value } = event.target;
        const transformedValue = FormUtils.transformInputToFouValue(value) ?? '';
        FormUtils.assignValue(formData, name, transformedValue);
        this.forceUpdate();
    }

    private _submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        const { onClose } = this.props;
        const { formData } = this.state;
        const masterServant = this._convertToMasterServant(formData);
        const bond = formData.bond === '' ? undefined : Number(formData.bond) as MasterServantBondLevel;
        const data = {
            masterServant,
            bond,
            costumes: []
        };
        onClose(event, 'submit', data);
    }

    private _cancel(event: MouseEvent<HTMLButtonElement>): void {
        const { onClose } = this.props;
        onClose(event, 'cancel');
    }

    private _convertToMasterServant(formData: FormData): Omit<MasterServant, 'instanceId'> {
        const {
            gameId,
            np,
            level,
            ascension,
            fouAtk,
            fouHp,
            skill1,
            skill2,
            skill3
        } = formData;

        return {
            gameId,
            np: Number(np) as any,
            level: Number(level),
            ascension: Number(ascension) as any,
            fouAtk: fouAtk === '' ? undefined : Number(fouAtk),
            fouHp: fouHp === '' ? undefined : Number(fouHp),
            skills: {
                1: Number(skill1) as MasterServantSkillLevel || 1,
                2: Number(skill2) as MasterServantSkillLevel || undefined,
                3: Number(skill3) as MasterServantSkillLevel || undefined
            }
        };
    }

    private _convertToFormData(masterServant: MasterServant | undefined): FormData {
        const { bondLevels } = this.props;

        if (!masterServant) {
            masterServant = MasterServantUtils.instantiate();
        }

        const {
            gameId,
            np,
            level,
            ascension,
            fouAtk,
            fouHp,
            skills
        } = masterServant;

        const servant = this._gameServantMap[gameId];
        const unlockedCostumesMap = this._generateUnlockedCostumesMap(servant);

        return {
            gameId,
            np,
            level,
            ascension,
            bond: bondLevels[gameId] ?? '',
            fouAtk: fouAtk ?? '',
            fouHp: fouHp ?? '',
            skill1: skills[1] || 1,
            skill2: skills[2] || '',
            skill3: skills[3] || '',
            unlockedCostumes: unlockedCostumesMap
        };
    }

    private _generateUnlockedCostumesMap(servant: GameServant | undefined): Record<number, boolean> {
        if (!servant) {
            return {};
        }
        const { unlockedCostumes } = this.props;
        const unlockedCostumesMap: Record<number, boolean> = {};
        for (const key of Object.keys(servant.costumes)) {
            const costumeId = Number(key);
            const costumeUnlocked = unlockedCostumes.indexOf(costumeId) !== -1;
            unlockedCostumesMap[costumeId] = costumeUnlocked;
        }
        return unlockedCostumesMap;
    }

}));
