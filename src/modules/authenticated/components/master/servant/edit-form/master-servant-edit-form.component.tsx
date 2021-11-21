import { GameServant, MasterServant, MasterServantBondLevel, MasterServantSkillLevel } from '@fgo-planner/types';
import { FormControl, InputLabel, Select, SelectChangeEvent, TextField } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { ChangeEvent, FocusEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { GameServantConstants } from '../../../../../../constants';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
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
    np: string;
    level: string;
    ascension: string;
    fouAtk: string;
    fouHp: string;
    skill1: string;
    skill2: string;
    skill3: string;
    // TODO Add append skills
    bond: string;
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
        np: String(np),
        level: String(level),
        ascension: String(ascension),
        bond: String(bondLevels[gameId] ?? ''),
        fouAtk: String(fouAtk ?? ''),
        fouHp: String(fouHp ?? ''),
        skill1: String(skills[1] || 1),
        skill2: String(skills[2] || ''),
        skill3: String(skills[3] || ''),
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
const getFouInputStepSize = (value: string | undefined): number => {
    const numberValue = Number(value);
    if (!numberValue || numberValue < GameServantConstants.MaxFou / 2) {
        return 10;
    }
    return 20;
};

export const StyleClassPrefix = 'MasterServantEditForm';

const StyleProps = (theme: Theme) => ({
    [`& .${StyleClassPrefix}-input-field-group`]: {
        display: 'flex',
        flexWrap: 'nowrap',
        [theme.breakpoints.down('sm')]: {
            flexWrap: 'wrap'
        },
        [`& .${InputFieldContainerStyleClassPrefix}-root`]: {
            flex: 1,
            px: 2,
            [theme.breakpoints.down('sm')]: {
                flex: '100% !important'
            }
        }
    }
} as SystemStyleObject<Theme>);

export const MasterServantEditForm = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

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
            formData.bond = String(bondLevels[servantId] ?? '');
            formData.unlockedCostumes = generateUnlockedCostumesMap(servant, unlockedCostumes);
            setServant(servant);
        }
    }, [formData, gameServantMap, bondLevels, unlockedCostumes]);

    const handleSelectInputChange = useCallback((event: SelectChangeEvent<string>): void => {
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

    const handleAscensionInputChange = useCallback((event: SelectChangeEvent<string>): void => {
        if (!formData || !servant) {
            return;
        }
        const { value } = event.target;
        const level = MasterServantUtils.roundToNearestValidLevel(Number(value), Number(formData.level), servant);
        formData.level = String(level);
        if (formData.ascension !== value) {
            formData.ascension = value;
            handleStatsChange();
        }
        forceUpdate();
    }, [formData, servant, handleStatsChange, forceUpdate]);

    const handleLevelInputBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        if (!formData || !servant) {
            return;
        }
        const { value } = event.target;
        const level = FormUtils.transformInputToInteger(value, GameServantConstants.MinLevel, GameServantConstants.MaxLevel) || 1;
        const ascension = MasterServantUtils.roundToNearestValidAscensionLevel(level, Number(formData.ascension), servant);
        formData.level = String(level);
        formData.ascension = String(ascension);
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
                className={clsx(`${StyleClassPrefix}-root`, className)}
                id={formId}
                noValidate
                onSubmit={handleSubmit}
            >
                <Box sx={StyleProps}>
                    <div className={`${StyleClassPrefix}-input-field-group`}>
                        <InputFieldContainer flex="50%">
                            {levelField}
                        </InputFieldContainer>
                        <InputFieldContainer flex="50%">
                            {ascensionField}
                        </InputFieldContainer>
                    </div>
                    <div className={`${StyleClassPrefix}-input-field-group`}>
                        <InputFieldContainer flex="50%">
                            {fouHpField}
                        </InputFieldContainer>
                        <InputFieldContainer flex="50%">
                            {fouAtkField}
                        </InputFieldContainer>
                    </div>
                    <div className={`${StyleClassPrefix}-input-field-group`}>
                        <InputFieldContainer>
                            {skill1Field}
                        </InputFieldContainer>
                        <InputFieldContainer>
                            {skill2Field}
                        </InputFieldContainer>
                        <InputFieldContainer>
                            {skill3Field}
                        </InputFieldContainer>
                    </div>
                    <div className={`${StyleClassPrefix}-input-field-group`}>
                        <InputFieldContainer flex="50%">
                            {npField}
                        </InputFieldContainer>
                        <InputFieldContainer flex="50%">
                            {bondField}
                        </InputFieldContainer>
                    </div>
                </Box>
            </form>
        );
    }

    // Dialog layout
    return (
        <form
            className={clsx(`${StyleClassPrefix}-root`, className)}
            id={formId}
            noValidate
            onSubmit={handleSubmit}
        >
            <Box sx={StyleProps}>
                <div className={`${StyleClassPrefix}-input-field-group`}>
                    <InputFieldContainer flex="75%">
                        <MasterServantEditFormAutocomplete
                            selectedServant={servant}
                            onChange={handleSelectedServantChange}
                            disabled={servantSelectDisabled || readonly}
                        />
                    </InputFieldContainer>
                    <InputFieldContainer flex="25%">
                        {npField}
                    </InputFieldContainer>
                </div>
                <div className={`${StyleClassPrefix}-input-field-group`}>
                    <InputFieldContainer>
                        {levelField}
                    </InputFieldContainer>
                    <InputFieldContainer>
                        {ascensionField}
                    </InputFieldContainer>
                    <InputFieldContainer>
                        {fouHpField}
                    </InputFieldContainer>
                    <InputFieldContainer>
                        {fouAtkField}
                    </InputFieldContainer>
                </div>
                <div className={`${StyleClassPrefix}-input-field-group`}>
                    <InputFieldContainer>
                        {skill1Field}
                    </InputFieldContainer>
                    <InputFieldContainer>
                        {skill2Field}
                    </InputFieldContainer>
                    <InputFieldContainer>
                        {skill3Field}
                    </InputFieldContainer>
                    <InputFieldContainer>
                        {bondField}
                    </InputFieldContainer>
                </div>
            </Box>
        </form>
    );

});
