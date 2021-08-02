import { FormControl, InputLabel, makeStyles, Select, StyleRules, TextField, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/styles';
import React, { ChangeEvent, FocusEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer } from '../../../../../../components/input/input-field-container.component';
import { GameServantConstants } from '../../../../../../constants';
import { useGameServantList } from '../../../../../../hooks/data/use-game-servant-list.hook';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
import { GameServant, MasterServant, MasterServantBondLevel } from '../../../../../../types';
import { MasterServantSkillLevel } from '../../../../../../types/data/master/servant/master-servant-skill-level.type';
import { ComponentStyleProps } from '../../../../../../types/internal/props/component-style-props.type';
import { FormUtils } from '../../../../../../utils/form.utils';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { MasterServantEditFormAutocomplete } from './master-servant-edit-form-autocomplete.component';

type Props = {
    formId: string;
    masterServant: Readonly<MasterServant>;
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    unlockedCostumes: Array<number>;
    servantSelectDisabled?: boolean;
    layout?: 'dialog' | 'panel';
    readonly?: boolean;
    /**
     * Called when stats are changed via the form. For performance reasons, this is
     * only called for some fields on blur instead of on change.
     */
    onStatsChange?: (data: SubmitData) => void;
    onSubmit?: (event: FormEvent<HTMLFormElement>, data: SubmitData) => void;
} & ComponentStyleProps;

export type FormData = {
    gameId: number;
    np: number;
    level: string | number;
    ascension: string | number;
    fouAtk: string | number;
    fouHp: string | number;
    skill1: string | number;
    skill2: string | number;
    skill3: string | number;
    // TODO Add append skills
    bond: string | number;
    unlockedCostumes: Record<number, boolean>;
};

export type SubmitData = {
    masterServant: Omit<MasterServant, 'instanceId'>;
    bond: MasterServantBondLevel | undefined,
    costumes: Array<number>
};

const generateUnlockedCostumesMap = (
    servant: GameServant | undefined,
    unlockedCostumes: Array<number>
): Record<number, boolean> => {

    if (!servant) {
        return {};
    }

    const unlockedCostumesMap: Record<number, boolean> = {};
    for (const key of Object.keys(servant.costumes)) {
        const costumeId = Number(key);
        const costumeUnlocked = unlockedCostumes.indexOf(costumeId) !== -1;
        unlockedCostumesMap[costumeId] = costumeUnlocked;
    }

    return unlockedCostumesMap;
};

const convertToFormData = (
    servant: GameServant | undefined,
    masterServant: MasterServant,
    bondLevels: Record<number, MasterServantBondLevel | undefined>,
    unlockedCostumes: Array<number>
): FormData => {

    const {
        gameId,
        np,
        level,
        ascension,
        fouAtk,
        fouHp,
        skills
    } = masterServant;

    const unlockedCostumesMap = generateUnlockedCostumesMap(servant, unlockedCostumes);

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
        // TODO Add append skills
        unlockedCostumes: unlockedCostumesMap
    };
};

const convertToMasterServant = (formData: FormData): Omit<MasterServant, 'instanceId'> => {
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
        },
        appendSkills: {} // TODO Implement append skills
    };
};

/**
 * Calculates the step size for the Fou number input fields based on the
 * current value of the field.
 */
const getFouInputStepSize = (value: string | number | undefined): number => {
    value = Number(value);
    if (!value || value < GameServantConstants.MaxFou / 2) {
        return 10;
    }
    return 20;
};

const style = (theme: Theme) => ({
    // root: {
    //     paddingTop: theme.spacing(4)
    // },
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
    classNamePrefix: 'MasterServantEditForm'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantEditForm = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const classes = useStyles();

    const {
        formId,
        masterServant,
        bondLevels,
        unlockedCostumes,
        servantSelectDisabled,
        readonly,
        layout,
        onStatsChange,
        onSubmit,
        className
    } = props;

    const [formData, setFormData] = useState<FormData>();
    const [servant, setServant] = useState<GameServant>();

    // TODO Add default value option in hook.
    const gameServantList = useGameServantList() || [];

    const gameServantMap = useGameServantMap();

    useEffect(() => {
        if (!gameServantMap) {
            return;
        }
        const servant = gameServantMap[masterServant.gameId];
        const formData = convertToFormData(servant, masterServant, bondLevels, unlockedCostumes);
        setFormData(formData);
        setServant(servant);
    }, [gameServantMap, masterServant, bondLevels, unlockedCostumes]);

    const handleStatsChange = useCallback((): void => {
        if (!formData || !onStatsChange) {
            return;
        }
        const masterServant = convertToMasterServant(formData);
        const bond = formData.bond === '' ? undefined : Number(formData.bond) as MasterServantBondLevel;
        const data = {
            masterServant,
            bond,
            costumes: []
        };
        onStatsChange(data);
    }, [formData, onStatsChange]);

    const handleSelectedServantChange = useCallback((event: ChangeEvent<{}>, value: GameServant): void => {
        if (!formData) {
            return;
        }
        const servantId = value._id;
        if (formData.gameId !== servantId) {
            const servant = gameServantMap?.[servantId];
            formData.gameId = servantId;
            formData.bond = bondLevels[servantId] ?? '';
            formData.unlockedCostumes = generateUnlockedCostumesMap(servant, unlockedCostumes);
            setServant(servant);
        }
    }, [formData, gameServantMap, bondLevels, unlockedCostumes]);

    const handleSelectInputChange = useCallback((event: ChangeEvent<{ name?: string; value: any }>): void => {
        if (!formData) {
            return;
        }
        const { name, value } = event.target;
        FormUtils.assignValue(formData, name!!, value);
        handleStatsChange();
        forceUpdate();
    }, [formData, forceUpdate, handleStatsChange]);

    const handleInputChange = useCallback((event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        if (!formData) {
            return;
        }
        const { name, value } = event.target;
        FormUtils.assignValue(formData, name!!, value);
        forceUpdate();
    }, [formData, forceUpdate]);

    const handleAscensionInputChange = useCallback((event: ChangeEvent<{ name?: string; value: any }>): void => {
        if (!formData || !servant) {
            return;
        }
        const { value } = event.target;
        const level = MasterServantUtils.roundToNearestValidLevel(Number(value), Number(formData.level), servant);
        formData.level = level;
        if (formData.ascension !== value) {
            formData.ascension = value;
            handleStatsChange();
        }
    }, [formData, servant, handleStatsChange]);

    const handleLevelInputBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        if (!formData || !servant) {
            return;
        }
        const { value } = event.target;
        const level = FormUtils.transformInputToInteger(value, GameServantConstants.MinLevel, GameServantConstants.MaxLevel) || 1;
        const ascension = MasterServantUtils.roundToNearestValidAscensionLevel(level, Number(formData.ascension), servant);
        formData.level = level;
        formData.ascension = ascension;
        handleStatsChange();
        forceUpdate();
    }, [formData, servant, forceUpdate, handleStatsChange]);

    const handleFouInputBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        if (!formData) {
            return;
        }
        const { name, value } = event.target;
        const transformedValue = FormUtils.transformInputToFouValue(value) ?? '';
        FormUtils.assignValue(formData, name, transformedValue);
        handleStatsChange();
        forceUpdate();
    }, [formData, forceUpdate, handleStatsChange]);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (!formData || readonly || !onSubmit) {
            return;
        }
        const masterServant = convertToMasterServant(formData);
        const bond = formData.bond === '' ? undefined : Number(formData.bond) as MasterServantBondLevel;
        const data = {
            masterServant,
            bond,
            costumes: []
        };
        onSubmit(event, data);
    }, [formData, readonly, onSubmit]);

    if (!formData || !servant) {
        return null;
    }

    const npField = (
        <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="np">NP Level</InputLabel>
            <Select
                native
                id={`${formId}-np`}
                name="np"
                label="NP Level"
                value={formData.np}
                onChange={handleSelectInputChange}
                disabled={readonly}
            >
                {GameServantConstants.NoblePhantasmLevels.map(level => (
                    <option key={level} value={level}>
                        {level}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

    const levelField = (
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
            onChange={handleInputChange}
            onBlur={handleLevelInputBlur}
            disabled={readonly}
        />
    );

    const ascensionField = (
        <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="ascension">Ascension</InputLabel>
            <Select
                native
                id={`${formId}-ascension`}
                name="ascension"
                label="Ascension"
                value={formData.ascension}
                onChange={handleAscensionInputChange}
                disabled={readonly}
            >
                {GameServantConstants.AscensionLevels.map(level => (
                    <option key={level} value={level}>
                        {level}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

    const fouHpField = (
        <TextField
            variant="outlined"
            fullWidth
            label="HP Fou"
            name="fouHp"
            type="number"
            inputProps={{
                step: getFouInputStepSize(formData.fouHp),
                min: GameServantConstants.MinFou,
                max: GameServantConstants.MaxFou
            }}
            value={formData.fouHp}
            onChange={handleInputChange}
            onBlur={handleFouInputBlur}
            disabled={readonly}
        />
    );

    const fouAtkField = (
        <TextField
            variant="outlined"
            fullWidth
            label="Atk. Fou"
            name="fouAtk"
            type="number"
            inputProps={{
                step: getFouInputStepSize(formData.fouAtk),
                min: GameServantConstants.MinFou,
                max: GameServantConstants.MaxFou
            }}
            value={formData.fouAtk}
            onChange={handleInputChange}
            onBlur={handleFouInputBlur}
            disabled={readonly}
        />
    );

    const skill1Field = (
        <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="skill1">Skill 1</InputLabel>
            <Select
                native
                id={`${formId}-skill1`}
                name="skill1"
                label="Skill 1"
                value={formData.skill1}
                onChange={handleSelectInputChange}
                disabled={readonly}
            >
                {GameServantConstants.SkillLevels.map(level => (
                    <option key={level} value={level}>
                        {level}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

    const skill2Field = (
        <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="skill2">Skill 2</InputLabel>
            <Select
                native
                id={`${formId}-skill2`}
                name="skill2"
                label="Skill 2"
                value={formData.skill2}
                onChange={handleSelectInputChange}
                disabled={readonly}
            >
                <option>{'\u2014'}</option> {/* Blank option */}
                {GameServantConstants.SkillLevels.map(level => (
                    <option key={level} value={level}>
                        {level}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

    const skill3Field = (
        <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="skill3">Skill 3</InputLabel>
            <Select
                native
                id={`${formId}-skill3`}
                name="skill3"
                label="Skill 3"
                value={formData.skill3}
                onChange={handleSelectInputChange}
                disabled={readonly}
            >
                <option>{'\u2014'}</option> {/* Blank option */}
                {GameServantConstants.SkillLevels.map(level => (
                    <option key={level} value={level}>
                        {level}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

    const bondField = (
        <FormControl variant="outlined" fullWidth>
            <InputLabel htmlFor="bond">Bond</InputLabel>
            <Select
                native
                id={`${formId}-bond`}
                name="bond"
                label="Bond"
                value={formData.bond}
                onChange={handleSelectInputChange}
                disabled={readonly}
            >
                <option>{/* Blank option */}</option>
                {GameServantConstants.BondLevels.map(level => (
                    <option key={level} value={level}>
                        {level}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

    if (layout === 'panel') {
        // Panel layout
        return (
            <form
                className={className}
                id={formId}
                noValidate
                onSubmit={handleSubmit}
            >
                <div className={classes.inputFieldGroup}>
                    <InputFieldContainer className={classes.inputFieldContainer} flex="50%">
                        {levelField}
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer} flex="50%">
                        {ascensionField}
                    </InputFieldContainer>
                </div>
                <div className={classes.inputFieldGroup}>
                    <InputFieldContainer className={classes.inputFieldContainer} flex="50%">
                        {fouHpField}
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer} flex="50%">
                        {fouAtkField}
                    </InputFieldContainer>
                </div>
                <div className={classes.inputFieldGroup}>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        {skill1Field}
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        {skill2Field}
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        {skill3Field}
                    </InputFieldContainer>
                </div>
                <div className={classes.inputFieldGroup}>
                    <InputFieldContainer className={classes.inputFieldContainer} flex="50%">
                        {npField}
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer} flex="50%">
                        {bondField}
                    </InputFieldContainer>
                </div>
            </form>
        );
    }

    // Dialog layout
    return (
        <form
            className={className}
            id={formId}
            noValidate
            onSubmit={handleSubmit}
        >
            <div className={classes.inputFieldGroup}>
                <InputFieldContainer className={classes.inputFieldContainer} flex="75%">
                    <MasterServantEditFormAutocomplete
                        servantList={gameServantList}
                        selectedServant={servant}
                        onChange={handleSelectedServantChange}
                        disabled={servantSelectDisabled || readonly}
                    />
                </InputFieldContainer>
                <InputFieldContainer className={classes.inputFieldContainer} flex="25%">
                    {npField}
                </InputFieldContainer>
            </div>
            <div className={classes.inputFieldGroup}>
                <InputFieldContainer className={classes.inputFieldContainer}>
                    {levelField}
                </InputFieldContainer>
                <InputFieldContainer className={classes.inputFieldContainer}>
                    {ascensionField}
                </InputFieldContainer>
                <InputFieldContainer className={classes.inputFieldContainer}>
                    {fouHpField}
                </InputFieldContainer>
                <InputFieldContainer className={classes.inputFieldContainer}>
                    {fouAtkField}
                </InputFieldContainer>
            </div>
            <div className={classes.inputFieldGroup}>
                <InputFieldContainer className={classes.inputFieldContainer}>
                    {skill1Field}
                </InputFieldContainer>
                <InputFieldContainer className={classes.inputFieldContainer}>
                    {skill2Field}
                </InputFieldContainer>
                <InputFieldContainer className={classes.inputFieldContainer}>
                    {skill3Field}
                </InputFieldContainer>
                <InputFieldContainer className={classes.inputFieldContainer}>
                    {bondField}
                </InputFieldContainer>
            </div>
        </form>
    );

});
