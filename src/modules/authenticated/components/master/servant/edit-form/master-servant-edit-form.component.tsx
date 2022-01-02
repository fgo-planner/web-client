import { GameServant, MasterServant, MasterServantBondLevel, MasterServantSkillLevel } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { ChangeEvent, FocusEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { ServantAscensionInputField } from '../../../../../../components/input/servant/servant-ascension-input-field.component';
import { ServantBondInputField } from '../../../../../../components/input/servant/servant-bond-input-field.component';
import { ServantFouInputField } from '../../../../../../components/input/servant/servant-fou-input-field.component';
import { ServantLevelInputField } from '../../../../../../components/input/servant/servant-level-input-field.component';
import { ServantNpLevelInputField } from '../../../../../../components/input/servant/servant-np-level-input-field.component';
import { ServantSkillInputField } from '../../../../../../components/input/servant/servant-skill-input-field.component copy';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
import { ComponentStyleProps } from '../../../../../../types/internal/props/component-style-props.type';
import { FormUtils } from '../../../../../../utils/form.utils';
import { MasterServantEditFormAutocomplete } from './master-servant-edit-form-autocomplete.component';

type Props = {
    formId: string;
    masterServant: Readonly<MasterServant>;
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    unlockedCostumes: Array<number>;
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
        skills,
        appendSkills
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
        appendSkill1: String(appendSkills[1] || ''),
        appendSkill2: String(appendSkills[2] || ''),
        appendSkill3: String(appendSkills[3] || ''),
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

    /**
     * Notifies the parent component of stats change by invoking the `onStatsChange`
     * callback function.
     */
    const pushStatsChange = useCallback((): void => {
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

    const handleInputChange = useCallback((name: string, value: string, pushChanges = false): void => {
        if (!formData) {
            return;
        }
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

    const handleLevelAscensionInputChange = useCallback((level: string, ascension: string, pushChanges = false): void => {
        if (!formData) {
            return;
        }
        formData.level = level;
        formData.ascension = ascension;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [formData, forceUpdate, pushStatsChange]);

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
            servant={servant}
            name='level'
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const ascensionField = (
        <ServantAscensionInputField
            level={formData.level}
            ascension={formData.ascension}
            servant={servant}
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
            label='Atk. Fou'
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
            allowBlank
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
            allowBlank
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const appendSkill1Field = (
        <ServantSkillInputField
            value={formData.appendSkill1}
            formId={formId}
            label='Append 1'
            name='appendSkill1'
            allowBlank
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const appendSkill2Field = (
        <ServantSkillInputField
            value={formData.appendSkill2}
            formId={formId}
            label='Append 2'
            name='appendSkill2'
            allowBlank
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const appendSkill3Field = (
        <ServantSkillInputField
            value={formData.appendSkill3}
            formId={formId}
            label='Append 3'
            name='appendSkill3'
            allowBlank
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
                        <MasterServantEditFormAutocomplete
                            selectedServant={servant}
                            onChange={handleSelectedServantChange}
                            disabled={servantSelectDisabled || readonly}
                        />
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
