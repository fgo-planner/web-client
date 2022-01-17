import { GameServant, MasterServant, PlanServant, PlanServantOwned, PlanServantType } from '@fgo-planner/types';
import { Tab, Tabs } from '@mui/material';
import { alpha, Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { ChangeEvent, FocusEvent, FormEvent, Fragment, ReactNode, SyntheticEvent, useCallback, useEffect, useState } from 'react';
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

type TabName = 'current' | 'target' | 'costumes'; // TODO Add costumes tab

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

/**
 * Converts the given `PlanServant` into a `FormData` object.
 */
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

/**
 * Converts the given `FormData` into a `PlanServant`.
 */
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

/**
 * Populates the "current fields" and 'instanceId` field in the `FormData` using
 * values from the `MasterServant`.
 */
const updateFormData = (formData: FormData, masterServant: Readonly<MasterServant>): void => {
    formData.instanceId = masterServant.instanceId;
    formData.currentLevel = String(masterServant.level);
    formData.currentAscension = String(masterServant.ascension);
    formData.currentFouAtk = String(masterServant.fouAtk ?? '');
    formData.currentFouHp = String(masterServant.fouHp ?? '');
    formData.currentSkill1 = String(masterServant.skills[1]);
    formData.currentSkill2 = String(masterServant.skills[2] || '');
    formData.currentSkill3 = String(masterServant.skills[3] || '');
    formData.currentAppendSkill1 = String(masterServant.appendSkills[1] || '');
    formData.currentAppendSkill2 = String(masterServant.appendSkills[2] || '');
    formData.currentAppendSkill3 = String(masterServant.appendSkills[3] || '');
    // FIXME We have to get the costume data from master account somehow.
};

export const StyleClassPrefix = 'PlanServantEditForm';

const StyleProps = (theme: Theme) => ({
    [`& .${StyleClassPrefix}-tabs-container`]: {
        mx: 4,
        mt: -6
    },
    [`& .${StyleClassPrefix}-tabs-content-container`]: {
        mx: 2,
        px: 4,
        pt: 8,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: alpha(theme.palette.text.primary, 0.23),
        borderRadius: 1
    },
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
    const [activeTab, setActiveTab] = useState<TabName>('target');

    const gameServantMap = useGameServantMap();

    // TODO Might have to store the availableServants in a ref.

    useEffect(() => {
        if (!gameServantMap) {
            return;
        }
        const formData = convertToFormData(planServant);
        const servant = gameServantMap[planServant.gameId];
        setFormData(formData);
        setServant(servant);
    }, [gameServantMap, planServant]);

    const handleActiveTabChange = useCallback((event: SyntheticEvent, value: TabName) => {
        setActiveTab(value);
    }, []);

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
            const masterServant = availableServants?.find(servant => servant.gameId === gameId && servant.instanceId === instanceId);
            if (!masterServant) {
                // TODO Is this case possible?
                return;
            }
            updateFormData(formData, masterServant);
        }
        setServant(servant);
    }, [availableServants, formData, gameServantMap]);

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

    //#region Tabs content

    let tabsContentNode: ReactNode;
    if (activeTab === 'costumes') {
        // TODO Implement this
        tabsContentNode = null;
    } else {
        
        const currentTabActive = activeTab === 'current';
        const fieldDisabled = readonly || (formData.type === PlanServantType.Owned && currentTabActive);

        const levelField = (
            <ServantLevelInputField
                level={currentTabActive ? formData.currentLevel : formData.targetLevel}
                ascension={currentTabActive ? formData.currentAscension : formData.targetAscension}
                servant={servant}
                label='Servant Level'
                name={currentTabActive ? 'currentLevel' : 'targetLevel'}
                onChange={handleLevelAscensionInputChange}
                disabled={fieldDisabled}
            />
        );

        const ascensionField = (
            <ServantAscensionInputField
                level={currentTabActive ? formData.currentLevel : formData.targetLevel}
                ascension={currentTabActive ? formData.currentAscension : formData.targetAscension}
                servant={servant}
                formId={formId}
                label='Ascension'
                name={currentTabActive ? 'currentAscension' : 'targetAscension'}
                onChange={handleLevelAscensionInputChange}
                disabled={fieldDisabled}
            />
        );

        const fouHpField = (
            <ServantFouInputField
                value={currentTabActive ? formData.currentFouHp : formData.targetFouHp}
                label='HP Fou'
                name={currentTabActive ? 'currentFouHp' : 'targetFouHp'}
                onChange={handleInputChange}
                onBlur={handleInputBlurEvent}
                disabled={fieldDisabled}
            />
        );

        const fouAtkField = (
            <ServantFouInputField
                value={currentTabActive ? formData.currentFouAtk : formData.targetFouAtk}
                label='ATK Fou'
                name={currentTabActive ? 'currentFouAtk' : 'targetFouAtk'}
                onChange={handleInputChange}
                onBlur={handleInputBlurEvent}
                disabled={fieldDisabled}
            />
        );

        const skill1Field = (
            <ServantSkillInputField
                value={currentTabActive ? formData.currentSkill1 : formData.targetSkill1}
                formId={formId}
                label='Skill 1'
                name={currentTabActive ? 'currentSkill1' : 'targetSkill1'}
                allowEmpty
                onChange={handleInputChange}
                disabled={fieldDisabled}
            />
        );

        const skill2Field = (
            <ServantSkillInputField
                value={currentTabActive ? formData.currentSkill2 : formData.targetSkill2}
                formId={formId}
                label='Skill 2'
                name={currentTabActive ? 'currentSkill2' : 'targetSkill2'}
                allowEmpty
                onChange={handleInputChange}
                disabled={fieldDisabled}
            />
        );

        const skill3Field = (
            <ServantSkillInputField
                value={currentTabActive ? formData.currentSkill3 : formData.targetSkill3}
                formId={formId}
                label='Skill 3'
                name={currentTabActive ? 'currentSkill3' : 'targetSkill3'}
                allowEmpty
                onChange={handleInputChange}
                disabled={fieldDisabled}
            />
        );

        const appendSkill1Field = (
            <ServantSkillInputField
                value={currentTabActive ? formData.currentAppendSkill1 : formData.targetAppendSkill1}
                formId={formId}
                label='Append 1'
                name={currentTabActive ? 'currentAppendSkill1' : 'targetAppendSkill1'}
                allowEmpty
                onChange={handleInputChange}
                disabled={fieldDisabled}
            />
        );

        const appendSkill2Field = (
            <ServantSkillInputField
                value={currentTabActive ? formData.currentAppendSkill2 : formData.targetAppendSkill2}
                formId={formId}
                label='Append 2'
                name={currentTabActive ? 'currentAppendSkill2' : 'targetAppendSkill2'}
                allowEmpty
                onChange={handleInputChange}
                disabled={fieldDisabled}
            />
        );

        const appendSkill3Field = (
            <ServantSkillInputField
                value={currentTabActive ? formData.currentAppendSkill3 : formData.targetAppendSkill3}
                formId={formId}
                label='Append 3'
                name={currentTabActive ? 'currentAppendSkill3' : 'targetAppendSkill3'}
                allowEmpty
                onChange={handleInputChange}
                disabled={fieldDisabled}
            />
        );

        tabsContentNode = (
            <Fragment>
                <div className={`${StyleClassPrefix}-input-field-group`}>
                    <InputFieldContainer>
                        {levelField}
                    </InputFieldContainer>
                    <InputFieldContainer>
                        {ascensionField}
                    </InputFieldContainer>
                    <InputFieldContainer className='empty'>
                        {/* Empty container for spacing purposes */}
                    </InputFieldContainer>
                </div>
                <div className={`${StyleClassPrefix}-input-field-group`}>
                    <InputFieldContainer>
                        {fouHpField}
                    </InputFieldContainer>
                    <InputFieldContainer>
                        {fouAtkField}
                    </InputFieldContainer>
                    <InputFieldContainer className='empty'>
                        {/* Empty container for spacing purposes */}
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
                {!showAppendSkills && (
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
                    </div>
                )}
            </Fragment>
        );
    }

    //#endregion


    // Panel layout
    if (layout === 'panel') {
        return null;
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
                <div className={`${StyleClassPrefix}-tabs-container`}>
                    <Tabs value={activeTab} onChange={handleActiveTabChange}>
                        <Tab label='Current' value='current' />
                        <Tab label='Target' value='target' />
                        <Tab label='Costumes' value='costumes' disabled />
                    </Tabs>
                </div>
                <div className={`${StyleClassPrefix}-tabs-content-container`}>
                    {tabsContentNode}
                </div>
            </Box>
        </form>
    );

});
