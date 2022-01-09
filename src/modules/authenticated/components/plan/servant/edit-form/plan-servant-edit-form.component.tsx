import { GameServant, MasterServant, PlanServant, PlanServantOwned, PlanServantType } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { ChangeEvent, FocusEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { ServantAscensionInputField } from '../../../../../../components/input/servant/servant-ascension-input-field.component';
import { ServantFouInputField } from '../../../../../../components/input/servant/servant-fou-input-field.component';
import { ServantLevelInputField } from '../../../../../../components/input/servant/servant-level-input-field.component';
import { ServantSkillInputField } from '../../../../../../components/input/servant/servant-skill-input-field.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
import { ComponentStyleProps } from '../../../../../../types/internal';
import { FormUtils } from '../../../../../../utils/form.utils';
import { PlanServantEditFormAutocomplete } from './plan-servant-edit-form-autocomplete.component';

export type SubmitData = {
    planServant: PlanServant;
};

type Props = {
    availableServants?: ReadonlyArray<MasterServant>;
    formId: string;
    layout?: 'dialog' | 'panel';
    /**
     * Called when stats are changed via the form. For performance reasons, this is
     * only called for some fields on blur instead of on change.
     */
    onStatsChange?: (data: SubmitData) => void;
    onSubmit?: (event: FormEvent<HTMLFormElement>, data: SubmitData) => void;
    planServant: Readonly<PlanServant>;
    readonly?: boolean;
    servantSelectDisabled?: boolean;
    showAppendSkills?: boolean;
} & Pick<ComponentStyleProps, 'className'>;

export type FormData = {
    type: PlanServantType;
    gameId: number;
    instanceId?: number;
    enabled: boolean;
    ascensionsEnabled: boolean;
    skillsEnabled: boolean;
    appendSkillsEnabled: boolean;
    costumesEnabled: boolean;
    currentLevel: string;
    currentAscension: string;
    currentFouAtk: string;
    currentFouHp: string;
    currentSkill1: string;
    currentSkill2: string;
    currentSkill3: string;
    currentAppendSkill1: string;
    currentAppendSkill2: string;
    currentAppendSkill3: string;
    currentCostumes: number[];
    targetLevel: string;
    targetAscension: string;
    targetFouAtk: string;
    targetFouHp: string;
    targetSkill1: string;
    targetSkill2: string;
    targetSkill3: string;
    targetAppendSkill1: string;
    targetAppendSkill2: string;
    targetAppendSkill3: string;
    targetCostumes: number[];
};

const convertToFormData = (planServant: PlanServant): FormData => {
    const {
        type,
        gameId,
        enabled,
        current,
        target
    } = planServant;

    const formData: FormData = {
        type,
        gameId,
        enabled: enabled.servant,
        ascensionsEnabled: enabled.ascensions,
        skillsEnabled: enabled.skills,
        appendSkillsEnabled: enabled.appendSkills,
        costumesEnabled: enabled.costumes,
        currentLevel: String(current.level),
        currentAscension: String(current.ascension),
        currentFouAtk: String(current.fouAtk ?? ''),
        currentFouHp: String(current.fouHp ?? ''),
        currentSkill1: String(current.skills[1] || ''),
        currentSkill2: String(current.skills[2] || ''),
        currentSkill3: String(current.skills[3] || ''),
        currentAppendSkill1: String(current.appendSkills[1] || ''),
        currentAppendSkill2: String(current.appendSkills[2] || ''),
        currentAppendSkill3: String(current.appendSkills[3] || ''),
        currentCostumes: current.costumes,
        targetLevel: String(target.level),
        targetAscension: String(target.ascension),
        targetFouAtk: String(target.fouAtk ?? ''),
        targetFouHp: String(target.fouHp ?? ''),
        targetSkill1: String(target.skills[1] || ''),
        targetSkill2: String(target.skills[2] || ''),
        targetSkill3: String(target.skills[3] || ''),
        targetAppendSkill1: String(target.appendSkills[1] || ''),
        targetAppendSkill2: String(target.appendSkills[2] || ''),
        targetAppendSkill3: String(target.appendSkills[3] || ''),
        targetCostumes: target.costumes
    };

    if (type === PlanServantType.Owned) {
        formData.instanceId = (planServant as PlanServantOwned).instanceId;
    } 

    return formData;
};

const convertToPlanServant = (formData: FormData): PlanServant => {

    const {
        type,
        gameId,
        instanceId,
        enabled,
        ascensionsEnabled,
        skillsEnabled,
        appendSkillsEnabled,
        costumesEnabled,
        currentLevel,
        currentAscension,
        currentFouAtk,
        currentFouHp,
        currentSkill1,
        currentSkill2,
        currentSkill3,
        currentAppendSkill1,
        currentAppendSkill2,
        currentAppendSkill3,
        currentCostumes,
        targetLevel,
        targetAscension,
        targetFouAtk,
        targetFouHp,
        targetSkill1,
        targetSkill2,
        targetSkill3,
        targetAppendSkill1,
        targetAppendSkill2,
        targetAppendSkill3,
        targetCostumes
    } = formData;

    const planServant: PlanServant = {
        type,
        gameId,
        enabled: {
            servant: enabled,
            ascensions: ascensionsEnabled,
            skills: skillsEnabled,
            appendSkills: appendSkillsEnabled,
            costumes: costumesEnabled
        },
        current: {
            level: FormUtils.convertToInteger(currentLevel),
            ascension: FormUtils.convertToNumber(currentAscension),
            fouAtk: FormUtils.convertToNumber(currentFouAtk),
            fouHp: FormUtils.convertToNumber(currentFouHp),
            skills: {
                1: FormUtils.convertToNumber(currentSkill1) || undefined,
                2: FormUtils.convertToNumber(currentSkill2) || undefined,
                3: FormUtils.convertToNumber(currentSkill3) || undefined
            },
            appendSkills: {
                1: FormUtils.convertToNumber(currentAppendSkill1) || undefined,
                2: FormUtils.convertToNumber(currentAppendSkill2) || undefined,
                3: FormUtils.convertToNumber(currentAppendSkill3) || undefined
            },
            costumes: currentCostumes
        },
        target: {
            level: FormUtils.convertToInteger(targetLevel),
            ascension: FormUtils.convertToNumber(targetAscension),
            fouAtk: FormUtils.convertToNumber(targetFouAtk),
            fouHp: FormUtils.convertToNumber(targetFouHp),
            skills: {
                1: FormUtils.convertToNumber(targetSkill1) || undefined,
                2: FormUtils.convertToNumber(targetSkill2) || undefined,
                3: FormUtils.convertToNumber(targetSkill3) || undefined
            },
            appendSkills: {
                1: FormUtils.convertToNumber(targetAppendSkill1) || undefined,
                2: FormUtils.convertToNumber(targetAppendSkill2) || undefined,
                3: FormUtils.convertToNumber(targetAppendSkill3) || undefined
            },
            costumes: targetCostumes
        }
    };

    if (type === PlanServantType.Owned) {
        (planServant as PlanServantOwned).instanceId = instanceId!;
    }

    return planServant;
};

export const StyleClassPrefix = 'PlanServantEditForm';

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

export const PlanServantEditForm = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const {
        availableServants,
        formId,
        layout,
        onStatsChange,
        onSubmit,
        readonly,
        planServant,
        servantSelectDisabled,
        showAppendSkills,
        className
    } = props;

    const [servant, setServant] = useState<GameServant>();
    const [formData, setFormData] = useState<FormData>(() => convertToFormData(planServant));

    const gameServantMap = useGameServantMap();

    // TODO Might have to store the availableServants in a ref.

    console.log(planServant)

    useEffect(() => {
        if (!gameServantMap) {
            return;
        }
        const formData = convertToFormData(planServant);
        const servant = gameServantMap[planServant.gameId];
        setFormData(formData);
        setServant(servant);
    }, [gameServantMap, planServant]);

    /**
     * Notifies the parent component of stats change by invoking the `onStatsChange`
     * callback function.
     */
    const pushStatsChange = useCallback((): void => {
        if (!onStatsChange) {
            return;
        }
        const planServant = convertToPlanServant(formData);
        const data = {
            planServant,
            costumes: []
        };
        onStatsChange(data);
    }, [formData, onStatsChange]);

    const handleSelectedServantChange = useCallback((event: ChangeEvent<{}>, value: { gameId: number, instanceId?: number }): void => {
        if (!gameServantMap) {
            return;
        }
        const { gameId, instanceId } = value;
        const servant = gameServantMap[gameId];
        formData.gameId = gameId;
        if (formData.type === PlanServantType.Owned) {
            formData.instanceId = instanceId!;
        }
        setServant(servant);
    }, [formData, gameServantMap]);

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
        if (name.startsWith('current')) {
            formData.currentLevel = level;
            formData.currentAscension = ascension;
        } else {
            formData.targetLevel = level;
            formData.targetAscension = ascension;
        }
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
        const planServant = convertToPlanServant(formData);
        const data = { planServant };
        onSubmit(event, data);
    }, [formData, readonly, onSubmit]);

    if (!servant) {
        return null;
    }

    //#region Current stat fields

    const currentLevelField = (
        <ServantLevelInputField
            level={formData.currentLevel}
            ascension={formData.currentAscension}
            servant={servant}
            label='Current Level'
            name='currentLevel'
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const currentAscensionField = (
        <ServantAscensionInputField
            level={formData.currentLevel}
            ascension={formData.currentAscension}
            servant={servant}
            formId={formId}
            label='Current Ascension'
            name='currentAscension'
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const currentFouHpField = (
        <ServantFouInputField
            value={formData.currentFouHp}
            label='Current HP Fou'
            name='currentFouHp'
            onChange={handleInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const currentFouAtkField = (
        <ServantFouInputField
            value={formData.currentFouAtk}
            label='Current ATK Fou'
            name='currentFouAtk'
            onChange={handleInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const currentSkill1Field = (
        <ServantSkillInputField
            value={formData.currentSkill1}
            formId={formId}
            label='Current Skill 1'
            name='currentSkill1'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const currentSkill2Field = (
        <ServantSkillInputField
            value={formData.currentSkill2}
            formId={formId}
            label='Current Skill 2'
            name='currentSkill2'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const currentSkill3Field = (
        <ServantSkillInputField
            value={formData.currentSkill3}
            formId={formId}
            label='Current Skill 3'
            name='currentSkill3'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const currentAppendSkill1Field = (
        <ServantSkillInputField
            value={formData.currentAppendSkill1}
            formId={formId}
            label='Current Append 1'
            name='currentAppendSkill1'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const currentAppendSkill2Field = (
        <ServantSkillInputField
            value={formData.currentAppendSkill2}
            formId={formId}
            label='Current Append 2'
            name='currentAppendSkill2'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const currentAppendSkill3Field = (
        <ServantSkillInputField
            value={formData.currentAppendSkill2}
            formId={formId}
            label='Current Append 3'
            name='currentAppendSkill3'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    //#endregion


    //#region Target stat fields

    const targetLevelField = (
        <ServantLevelInputField
            level={formData.targetLevel}
            ascension={formData.targetAscension}
            servant={servant}
            label='Target Level'
            name='targetLevel'
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const targetAscensionField = (
        <ServantAscensionInputField
            level={formData.targetLevel}
            ascension={formData.targetAscension}
            servant={servant}
            formId={formId}
            label='Target Ascension'
            name='targetAscension'
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const targetFouHpField = (
        <ServantFouInputField
            value={formData.targetFouHp}
            label='Target HP Fou'
            name='targetFouHp'
            onChange={handleInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const targetFouAtkField = (
        <ServantFouInputField
            value={formData.targetFouAtk}
            label='Target ATK Fou'
            name='targetFouAtk'
            onChange={handleInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const targetSkill1Field = (
        <ServantSkillInputField
            value={formData.targetSkill1}
            formId={formId}
            label='Target Skill 1'
            name='targetSkill1'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const targetSkill2Field = (
        <ServantSkillInputField
            value={formData.targetSkill2}
            formId={formId}
            label='Target Skill 2'
            name='targetSkill2'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const targetSkill3Field = (
        <ServantSkillInputField
            value={formData.targetSkill3}
            formId={formId}
            label='Target Skill 3'
            name='targetSkill3'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const targetAppendSkill1Field = (
        <ServantSkillInputField
            value={formData.targetAppendSkill1}
            formId={formId}
            label='Target Append 1'
            name='targetAppendSkill1'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const targetAppendSkill2Field = (
        <ServantSkillInputField
            value={formData.targetAppendSkill2}
            formId={formId}
            label='Target Append 2'
            name='targetAppendSkill2'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const targetAppendSkill3Field = (
        <ServantSkillInputField
            value={formData.targetAppendSkill2}
            formId={formId}
            label='Target Append 3'
            name='targetAppendSkill3'
            allowEmpty
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    //#endregion


    // Panel layout
    if (layout === 'panel') {
        // TODO Add panel layout
    }

    /**
     * The servant selection autocomplete field. This is only present in dialog
     * layout mode.
     */
    const autocompleteField = (
        <PlanServantEditFormAutocomplete
            availableServants={availableServants}
            selectedInstanceId={formData.instanceId}
            selectedServant={servant}
            type={formData.type}
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
                    <InputFieldContainer>
                        {autocompleteField}
                    </InputFieldContainer>
                </div>
            </Box>
        </form>
    );

});
