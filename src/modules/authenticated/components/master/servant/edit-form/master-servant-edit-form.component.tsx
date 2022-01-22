import { GameServant, MasterServant, MasterServantAscensionLevel, MasterServantBondLevel, MasterServantNoblePhantasmLevel } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { ChangeEvent, FocusEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { ServantAscensionInputField } from '../../../../../../components/input/servant/servant-ascension-input-field.component';
import { ServantBondInputField } from '../../../../../../components/input/servant/servant-bond-input-field.component';
import { ServantFouInputField } from '../../../../../../components/input/servant/servant-fou-input-field.component';
import { ServantLevelInputField } from '../../../../../../components/input/servant/servant-level-input-field.component';
import { ServantNpLevelInputField } from '../../../../../../components/input/servant/servant-np-level-input-field.component';
import { ServantSkillInputField } from '../../../../../../components/input/servant/servant-skill-input-field.component';
import { GameServantConstants } from '../../../../../../constants';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
import { ReadonlyRecord } from '../../../../../../types/internal';
import { ComponentStyleProps } from '../../../../../../types/internal/props/component-style-props.type';
import { FormUtils } from '../../../../../../utils/form.utils';
import { MasterServantEditFormAutocomplete } from './master-servant-edit-form-autocomplete.component';

type Props = {
    formId: string;
    masterServant: Readonly<MasterServant>;
    bondLevels: ReadonlyRecord<number, MasterServantBondLevel>;
    unlockedCostumes: ReadonlyArray<number>;
    servantSelectDisabled?: boolean;
    showAppendSkills?: boolean;
    layout?: 'dialog' | 'panel';
    readonly?: boolean;
    /**
     * Called when stats are changed via the form. For performance reasons, this is
     * only called for some fields on blur instead of on change.
     */
    onStatsChange?: (data: SubmitData) => void;
    onSubmit?: (event: FormEvent<HTMLFormElement>, data: SubmitData) => void;
} & Pick<ComponentStyleProps, 'className'>;

export type FormData = {
    gameId: number;
    summoned: boolean,
    summonDate: Date | undefined,
    np: string;
    level: string;
    ascension: string;
    fouAtk: string;
    fouHp: string;
    skill1: string;
    skill2: string;
    skill3: string;
    appendSkill1: string;
    appendSkill2: string;
    appendSkill3: string;
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
    unlockedCostumes: ReadonlyArray<number>
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
    bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
    unlockedCostumes: ReadonlyArray<number>
): FormData => {

    const {
        gameId,
        summoned,
        summonDate,
        np,
        level,
        ascension,
        fouAtk,
        fouHp,
        skills,
        appendSkills
    } = masterServant;

    const unlockedCostumesMap = generateUnlockedCostumesMap(servant, unlockedCostumes);

    return {
        gameId,
        summoned,
        summonDate,
        np: String(np),
        level: String(level),
        ascension: String(ascension),
        bond: String(bondLevels[gameId] ?? ''),
        fouAtk: String(fouAtk ?? ''),
        fouHp: String(fouHp ?? ''),
        skill1: String(skills[1] || 1),
        skill2: String(skills[2] || ''),
        skill3: String(skills[3] || ''),
        appendSkill1: String(appendSkills[1] || ''),
        appendSkill2: String(appendSkills[2] || ''),
        appendSkill3: String(appendSkills[3] || ''),
        unlockedCostumes: unlockedCostumesMap
    };
};

const convertToMasterServant = (formData: FormData): Omit<MasterServant, 'instanceId'> => {

    const {
        gameId,
        summoned,
        summonDate,
        np,
        level,
        ascension,
        fouAtk,
        fouHp,
        skill1,
        skill2,
        skill3,
        appendSkill1,
        appendSkill2,
        appendSkill3
    } = formData;

    return {
        gameId,
        summoned,
        summonDate: summonDate ? new Date(summonDate) : undefined,
        np: Number(np) as MasterServantNoblePhantasmLevel,
        level: Number(level),
        ascension: Number(ascension) as MasterServantAscensionLevel,
        fouAtk: FormUtils.convertToInteger(fouAtk),
        fouHp: FormUtils.convertToInteger(fouHp),
        skills: {
            1: FormUtils.convertToInteger(skill1) || GameServantConstants.MinSkillLevel,
            2: FormUtils.convertToInteger(skill2) || undefined,
            3: FormUtils.convertToInteger(skill3) || undefined
        },
        appendSkills: {
            1: FormUtils.convertToInteger(appendSkill1) || undefined,
            2: FormUtils.convertToInteger(appendSkill2) || undefined,
            3: FormUtils.convertToInteger(appendSkill3) || undefined,
        }
    };

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
                flex: '100% !important',
                '&.empty': {
                    display: 'none'
                }
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
        showAppendSkills,
        readonly,
        layout,
        onStatsChange,
        onSubmit,
        className
    } = props;

    const [gameServant, setGameServant] = useState<GameServant>();
    const [formData, setFormData] = useState<FormData>(() => convertToFormData(gameServant, masterServant, bondLevels, unlockedCostumes));

    const gameServantMap = useGameServantMap();

    useEffect(() => {
        if (!gameServantMap) {
            return;
        }
        const servant = gameServantMap[masterServant.gameId];
        const formData = convertToFormData(servant, masterServant, bondLevels, unlockedCostumes);
        setFormData(formData);
        setGameServant(servant);
    }, [gameServantMap, masterServant, bondLevels, unlockedCostumes]);

    /**
     * Notifies the parent component of stats change by invoking the `onStatsChange`
     * callback function.
     */
    const pushStatsChange = useCallback((): void => {
        if (!onStatsChange) {
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
        const servantId = value._id;
        if (formData.gameId !== servantId) {
            const servant = gameServantMap?.[servantId];
            formData.gameId = servantId;
            formData.bond = String(bondLevels[servantId] ?? '');
            formData.unlockedCostumes = generateUnlockedCostumesMap(servant, unlockedCostumes);
            setGameServant(servant);
        }
    }, [formData, gameServantMap, bondLevels, unlockedCostumes]);

    const handleInputChange = useCallback((name: string, value: string, pushChanges = false): void => {
        FormUtils.assignValue(formData, name!!, value);
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [formData, forceUpdate, pushStatsChange]);

    const handleInputBlurEvent = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        pushStatsChange();
        forceUpdate();
    }, [forceUpdate, pushStatsChange]);

    const handleLevelAscensionInputChange = useCallback((name: string, level: string, ascension: string, pushChanges = false): void => {
        formData.level = level;
        formData.ascension = ascension;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [formData, forceUpdate, pushStatsChange]);

    const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (readonly || !onSubmit) {
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

    if (!gameServant) {
        return null;
    }

    const npField = (
        <ServantNpLevelInputField
            value={formData.np}
            formId={formId}
            name='np'
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const levelField = (
        <ServantLevelInputField
            level={formData.level}
            ascension={formData.ascension}
            gameServant={gameServant}
            name='level'
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const ascensionField = (
        <ServantAscensionInputField
            level={formData.level}
            ascension={formData.ascension}
            gameServant={gameServant}
            formId={formId}
            name='ascension'
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const fouHpField = (
        <ServantFouInputField
            value={formData.fouHp}
            label='HP Fou'
            name='fouHp'
            onChange={handleInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const fouAtkField = (
        <ServantFouInputField
            value={formData.fouAtk}
            label='ATK Fou'
            name='fouAtk'
            onChange={handleInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const skill1Field = (
        <ServantSkillInputField
            value={formData.skill1}
            formId={formId}
            label='Skill 1'
            name='skill1'
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const skill2Field = (
        <ServantSkillInputField
            value={formData.skill2}
            formId={formId}
            label='Skill 2'
            name='skill2'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const skill3Field = (
        <ServantSkillInputField
            value={formData.skill3}
            formId={formId}
            label='Skill 3'
            name='skill3'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const appendSkill1Field = (
        <ServantSkillInputField
            value={formData.appendSkill1}
            formId={formId}
            label={layout === 'panel' ? 'App. 1' : 'Append 1'}
            name='appendSkill1'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const appendSkill2Field = (
        <ServantSkillInputField
            value={formData.appendSkill2}
            formId={formId}
            label={layout === 'panel' ? 'App. 2' : 'Append 2'}
            name='appendSkill2'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const appendSkill3Field = (
        <ServantSkillInputField
            value={formData.appendSkill3}
            formId={formId}
            label={layout === 'panel' ? 'App. 3' : 'Append 3'}
            name='appendSkill3'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const bondField = (
        <ServantBondInputField
            value={formData.bond}
            formId={formId}
            name='bond'
            onChange={handleInputChange}
            allowEmpty
            disabled={readonly}
        />
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
                        <InputFieldContainer flex='50%'>
                            {levelField}
                        </InputFieldContainer>
                        <InputFieldContainer flex='50%'>
                            {ascensionField}
                        </InputFieldContainer>
                    </div>
                    <div className={`${StyleClassPrefix}-input-field-group`}>
                        <InputFieldContainer flex='50%'>
                            {fouHpField}
                        </InputFieldContainer>
                        <InputFieldContainer flex='50%'>
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
                    {showAppendSkills && (
                        <div className={`${StyleClassPrefix}-input-field-group`}>
                            <InputFieldContainer>
                                {appendSkill1Field}
                            </InputFieldContainer>
                            <InputFieldContainer>
                                {appendSkill2Field}
                            </InputFieldContainer>
                            <InputFieldContainer>
                                {appendSkill3Field}
                            </InputFieldContainer>
                        </div>)
                    }
                    <div className={`${StyleClassPrefix}-input-field-group`}>
                        <InputFieldContainer flex='50%'>
                            {npField}
                        </InputFieldContainer>
                        <InputFieldContainer flex='50%'>
                            {bondField}
                        </InputFieldContainer>
                    </div>
                </Box>
            </form>
        );
    }

    /**
     * The servant selection autocomplete field. This is only present in dialog
     * layout mode.
     */
    const autocompleteField = (
        <MasterServantEditFormAutocomplete
            selectedServant={gameServant}
            onChange={handleSelectedServantChange}
            disabled={servantSelectDisabled || readonly}
        />
    );

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
                    <InputFieldContainer flex='75%'>
                        {autocompleteField}
                    </InputFieldContainer>
                    <InputFieldContainer flex='25%'>
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
                        {bondField}
                    </InputFieldContainer>
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
                {showAppendSkills && (
                    <div className={`${StyleClassPrefix}-input-field-group`}>
                        <InputFieldContainer className='empty'>
                            {/* Empty container for spacing purposes */}
                        </InputFieldContainer>
                        <InputFieldContainer>
                            {appendSkill1Field}
                        </InputFieldContainer>
                        <InputFieldContainer>
                            {appendSkill2Field}
                        </InputFieldContainer>
                        <InputFieldContainer>
                            {appendSkill3Field}
                        </InputFieldContainer>
                    </div>
                )}
            </Box>
        </form>
    );

});
