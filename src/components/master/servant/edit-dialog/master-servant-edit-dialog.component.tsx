import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, StyleRules, TextField, Theme, Typography, withStyles } from '@material-ui/core';
import { GameServantConstants } from 'app-constants';
import { InputFieldContainer } from 'components';
import { GameServant, MasterServant } from 'data';
import { ModalComponent, ModalOnCloseHandler, ReadonlyRecord, WithStylesProps } from 'internal';
import React, { ChangeEvent, FocusEvent, FormEvent, MouseEvent, ReactNode } from 'react';
import { GameServantService } from 'services';
import { Container as Injectables } from 'typedi';
import { FormUtils, MasterServantUtils } from 'utils';
import { MasterServantEditDialogAutocomplete } from './master-servant-edit-dialog-autocomplete.component';

type FormData = {
    gameId: number;
    level: string | number;
    ascensionLevel: string | number;
    bond: string | number;
    fouAtk: string | number;
    fouHp: string | number;
    skillLevel1: string | number;
    skillLevel2: string | number;
    skillLevel3: string | number;
    noblePhantasmLevel: number;
};

type Props = {
    /**
     * The master servant to edit. If not provided, the dialog will instantiate a
     * new servant.
     */
    masterServant?: MasterServant;
    disableServantSelect?: boolean;
    dialogTitle?: string;
    submitButtonLabel?: string;
    open: boolean;
    onClose: ModalOnCloseHandler<Omit<MasterServant, 'instanceId'>>;
} & WithStylesProps;

type State = {
    formData: FormData;
};

const style = (theme: Theme) => ({
    root: {
    },
    form: {
        width: '500px',
        paddingTop: theme.spacing(4)
    },
    inputFieldGroup: {
        flexWrap: 'nowrap',
        [theme.breakpoints.down('sm')]: {
            flexWrap: 'wrap'
        }
    },
    inputFieldContainer: {
        flex: 1,
        [theme.breakpoints.down('sm')]: {
            flex: '100% !important'
        }
    }
} as StyleRules);

export const MasterServantEditDialog = withStyles(style)(class extends ModalComponent<Props, State> {

    private readonly _formId = 'servant-form';

    private _gameServantService = Injectables.get(GameServantService);

    private _gameServantList: ReadonlyArray<Readonly<GameServant>> = [];

    private _gameServantMap: ReadonlyRecord<number, Readonly<GameServant>> = {};

    constructor(props: Props) {
        super(props);

        this.state = {
            formData: this._convertToFormData(props.masterServant)
        };

        this._renderForm = this._renderForm.bind(this);
        this._renderServantNameField = this._renderServantNameField.bind(this);
        this._handleSelectedServantChange = this._handleSelectedServantChange.bind(this);
        this._handleSelectInputChange = this._handleSelectInputChange.bind(this);
        this._handleInputChange = this._handleInputChange.bind(this);
        this._handleAscensionInputChange = this._handleAscensionInputChange.bind(this);
        this._handleLevelInputBlur = this._handleLevelInputBlur.bind(this);
        this._handleFouInputBlur = this._handleFouInputBlur.bind(this);
        this._submit = this._submit.bind(this);
        this._cancel = this._cancel.bind(this);
    }

    componentDidMount() {
        this._gameServantService.getServants().then(gameServantList => {
            this._gameServantList = gameServantList;
            this.forceUpdate();
        });
        this._gameServantService.getServantsMap().then(gameServantMap => {
            this._gameServantMap = gameServantMap;
            this.forceUpdate();
        });
    }

    componentDidUpdate(prevProps: Props) {
        const {  masterServant, open } = this.props;
        if (masterServant !== prevProps.masterServant || (open && !prevProps.open)) {
            const formData = this._convertToFormData(masterServant);
            this.setState({ formData });
        }
    }

    render(): ReactNode {
        const { dialogTitle, submitButtonLabel, open, onClose } = this.props;
        return (
            <Dialog open={open} onClose={onClose} keepMounted={false}>
                <Typography component={'div'}>
                    <DialogTitle>
                        {dialogTitle}
                    </DialogTitle>
                    <DialogContent>
                        {this._renderForm()}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="text"
                            color="secondary"
                            onClick={this._cancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="text"
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
                <Box className={classes.inputFieldGroup} display="flex">
                    <InputFieldContainer className={classes.inputFieldContainer} flex="75%">
                        {this._renderServantNameField()}
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer} flex="25%">
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel htmlFor="noblePhantasmLevel">NP Level</InputLabel>
                            <Select
                                native
                                id="noblePhantasmLevel"
                                name="noblePhantasmLevel"
                                label="NP Level"
                                value={formData.noblePhantasmLevel}
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
                </Box>
                <Box className={classes.inputFieldGroup} display="flex">
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
                            <InputLabel htmlFor="ascensionLevel">Ascension</InputLabel>
                            <Select
                                native
                                id="ascensionLevel"
                                name="ascensionLevel"
                                label="Ascension"
                                value={formData.ascensionLevel}
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
                </Box>
                <Box className={classes.inputFieldGroup} display="flex">
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <FormControl variant="outlined" fullWidth>
                            <InputLabel htmlFor="skillLevel1">Skill 1</InputLabel>
                            <Select
                                native
                                id="skillLevel1"
                                name="skillLevel1"
                                label="Skill 1"
                                value={formData.skillLevel1}
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
                            <InputLabel htmlFor="skillLevel2">Skill 2</InputLabel>
                            <Select
                                native
                                id="skillLevel2"
                                name="skillLevel2"
                                label="Skill 2"
                                value={formData.skillLevel2}
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
                            <InputLabel htmlFor="skillLevel3">Skill 3</InputLabel>
                            <Select
                                native
                                id="skillLevel3"
                                name="skillLevel3"
                                label="Skill 3"
                                value={formData.skillLevel3}
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
                </Box>
            </form>
        );
    }

    private _renderServantNameField(): ReactNode {
        const { disableServantSelect } = this.props;
        const { formData } = this.state;
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        formData.gameId = value._id!!;
        this.forceUpdate();
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
        formData.ascensionLevel = value;
        this.forceUpdate();
    }

    private _handleLevelInputBlur(event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const { formData } = this.state;
        const servant = this._gameServantMap[formData.gameId];
        const { value } = event.target;
        const level = FormUtils.transformInputToInteger(value, GameServantConstants.MinLevel, GameServantConstants.MaxLevel) || 1;
        const ascensionLevel = MasterServantUtils.roundToNearestValidAscensionLevel(level, Number(formData.ascensionLevel), servant);
        formData.level = level;
        formData.ascensionLevel = ascensionLevel;
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
        const masterServant = this._convertFromFormData(formData);
        onClose(event, 'submit', masterServant);
    }

    private _cancel(event: MouseEvent<HTMLButtonElement>): void {
        const { onClose } = this.props;
        onClose(event, 'cancel');
    }

    private _convertFromFormData(formData: FormData): Omit<MasterServant, 'instanceId'> {
        const {
            gameId,
            level,
            ascensionLevel,
            bond,
            fouAtk,
            fouHp,
            skillLevel1,
            skillLevel2,
            skillLevel3,
            noblePhantasmLevel
        } = formData;

        return {
            gameId,
            level: Number(level),
            ascensionLevel: Number(ascensionLevel),
            bond: bond ? Number(bond) : undefined,
            fouAtk: fouAtk === '' ? undefined : Number(fouAtk),
            fouHp: fouHp === '' ? undefined : Number(fouHp),
            skillLevels: {
                1: Number(skillLevel1) || 1,
                2: Number(skillLevel2) || undefined,
                3: Number(skillLevel3) || undefined
            },
            noblePhantasmLevel: Number(noblePhantasmLevel)
        };
    }

    private _convertToFormData(masterServant?: MasterServant): FormData {
        if (!masterServant) {
            masterServant = MasterServantUtils.instantiate();
        }
        const {
            gameId,
            level,
            ascensionLevel,
            bond,
            fouAtk,
            fouHp,
            skillLevels,
            noblePhantasmLevel
        } = masterServant;

        return {
            gameId,
            level,
            ascensionLevel,
            bond: bond ?? '',
            fouAtk: fouAtk ?? '',
            fouHp: fouHp ?? '',
            skillLevel1: skillLevels[1] || 1,
            skillLevel2: skillLevels[2] || '',
            skillLevel3: skillLevels[3] || '',
            noblePhantasmLevel: noblePhantasmLevel
        };
    }

});
