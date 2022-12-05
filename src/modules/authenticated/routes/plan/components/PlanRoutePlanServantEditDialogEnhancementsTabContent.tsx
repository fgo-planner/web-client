import { Immutable } from '@fgo-planner/common-core';
import { GameServant, ImmutableMasterServant, InstantiatedServantAscensionLevel, InstantiatedServantFouSet, InstantiatedServantSkillLevel, InstantiatedServantSkillSet, InstantiatedServantSkillSlot, InstantiatedServantUpdateBoolean, InstantiatedServantUpdateNumber, PlanServantUpdate } from '@fgo-planner/data-core';
import { Checkbox } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { useCallback } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../components/input/input-field-container.component';
import { ServantAscensionInputField } from '../../../../../components/input/servant/ServantAscensionInputField';
import { ServantFouInputField } from '../../../../../components/input/servant/ServantFouInputField';
import { ServantFouQuickToggleButtons } from '../../../../../components/input/servant/ServantFouQuickToggleButtons';
import { ServantLevelInputField } from '../../../../../components/input/servant/ServantLevelInputField';
import { ServantLevelQuickToggleButtons } from '../../../../../components/input/servant/ServantLevelQuickToggleButtons';
import { ServantSkillInputField } from '../../../../../components/input/servant/ServantSkillInputField';
import { ServantSkillQuickToggleButtons } from '../../../../../components/input/servant/ServantSkillQuickToggleButtons';
import { useForceUpdate } from '../../../../../hooks/utils/use-force-update.hook';
import { MasterServantAggregatedData, PlanEnhancementCategory } from '../../../../../types';
import { PlanRoutePlanServantEditDialogEnabledCheckbox } from './PlanRoutePlanServantEditDialogEnabledCheckbox';

type Props = {
    /**
     * The servant update data. This object will be modified directly.
     */
    planServantUpdate: PlanServantUpdate;
    targetMasterServantsData: ReadonlyArray<MasterServantAggregatedData>;
};

const CurrentTextLabel = 'Current: ';

const generateCurrentTextLabel = (currentValue: number | undefined): string | undefined => {
    if (currentValue === undefined) {
        return undefined;
    }
    return CurrentTextLabel + currentValue;
};

const StyleClassPrefix = 'PlanServantEditEnhancementsTabContent';

const StyleProps = (theme: Theme) => ({
    overflowY: 'auto',
    height: '100%',
    boxSizing: 'border-box',
    px: 6,
    pt: 8,
    [`& .${StyleClassPrefix}-toggle-button-group`]: {
        width: 128,
        height: 56,
        ml: 2,
        [theme.breakpoints.down('sm')]: {
            display: 'none'
        }
    },
    [`& .${StyleClassPrefix}-input-field-group`]: {
        display: 'flex',
        flexWrap: 'nowrap',
        [theme.breakpoints.down('sm')]: {
            flexWrap: 'wrap'
        },
        [`& .${StyleClassPrefix}-checkbox-container`]: {
            display: 'flex',
            alignItems: 'center',
            width: 42,
            height: 56,
            ml: -1
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

export const PlanRoutePlanServantEditDialogEnhancementsTabContent = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const {
        planServantUpdate,
        targetMasterServantsData
    } = props;


    //#region Input event handlers

    // eslint-disable-next-line max-len
    const handleEnableCheckboxChange = useCallback((enhancement: PlanEnhancementCategory, value: InstantiatedServantUpdateBoolean): void => {
        planServantUpdate.enabled[enhancement] = value;
        forceUpdate();
    }, [forceUpdate, planServantUpdate]);

    const handleLevelAscensionInputChange = useCallback((level: string, ascension: string): void => {
        planServantUpdate.level = Number(level) || null;
        planServantUpdate.ascension = Number(ascension) as InstantiatedServantAscensionLevel || null;
        forceUpdate();
    }, [forceUpdate, planServantUpdate]);

    // eslint-disable-next-line max-len
    const handleSkillInputChange = useCallback((set: InstantiatedServantSkillSet, slot: InstantiatedServantSkillSlot, value: string): void => {
        if (!value) {
            planServantUpdate[set][slot] = null;
        } else {
            const skillLevel = Number(value) as InstantiatedServantUpdateNumber<InstantiatedServantSkillLevel>;
            planServantUpdate[set][slot] = skillLevel;
        }
        forceUpdate();
    }, [forceUpdate, planServantUpdate]);

    const handleFouInputChange = useCallback((set: InstantiatedServantFouSet, value: string): void => {
        if (!value) {
            planServantUpdate[set] = null;
        } else {
            planServantUpdate[set] = Number(value);
        }
        forceUpdate();
    }, [forceUpdate, planServantUpdate]);

    const handleInputBlurEvent = useCallback((): void => {
        forceUpdate();
    }, [forceUpdate]);

    const handleLevelQuickToggleClick = useCallback((level: number, ascension: InstantiatedServantAscensionLevel): void => {
        if (planServantUpdate.ascension === ascension && planServantUpdate.level === level) {
            return;
        }
        handleLevelAscensionInputChange(
            String(level),
            String(ascension)
        );
    }, [handleLevelAscensionInputChange, planServantUpdate.ascension, planServantUpdate.level]);

    const handleFouQuickToggleClick = useCallback((value: number): void => {
        if (planServantUpdate.fouHp === value && planServantUpdate.fouAtk === value) {
            return;
        }
        planServantUpdate.fouHp = value;
        planServantUpdate.fouAtk = value;
        forceUpdate();
    }, [forceUpdate, planServantUpdate]);

    // eslint-disable-next-line max-len
    const handleSkillQuickToggleClick = useCallback((value: InstantiatedServantSkillLevel | null, set: InstantiatedServantSkillSet): void => {
        const skillSet = planServantUpdate[set];
        if (skillSet[1] === value && skillSet[2] === value && skillSet[3] === value) {
            return;
        }
        skillSet[1] = value;
        skillSet[2] = value;
        skillSet[3] = value;
        forceUpdate();
    }, [forceUpdate, planServantUpdate]);

    //#endregion


    //#region Input fields

    const {
        enabled,
        level,
        ascension,
        fouAtk,
        fouHp,
        skills,
        appendSkills
    } = planServantUpdate;

    const multiEditMode = targetMasterServantsData.length > 1;

    let targetGameServant: Immutable<GameServant> | undefined;
    let targetMasterServant: ImmutableMasterServant | undefined;
    if (!multiEditMode) {
        /**
         * This can be empty during the initial render.
         */
        if (!targetMasterServantsData.length) {
            return null;
        }
        const targetMasterServantData = targetMasterServantsData[0];
        targetGameServant = targetMasterServantData.gameServant;
        targetMasterServant = targetMasterServantData.masterServant;
    }

    const enableAscensionsCheckbox = (
        <PlanRoutePlanServantEditDialogEnabledCheckbox
            enhancement='ascensions'
            label='Ascensions/levels'
            multiEditMode={multiEditMode}
            value={enabled.ascensions}
            onChange={handleEnableCheckboxChange}
        />
    );

    // TODO Add a flag to enable/disable fous
    const enableFousCheckbox = (
         <Checkbox disabled />
    );

    const enableSkillsCheckbox = (
        <PlanRoutePlanServantEditDialogEnabledCheckbox
            enhancement='skills'
            label='Skills'
            multiEditMode={multiEditMode}
            value={enabled.skills}
            onChange={handleEnableCheckboxChange}
        />
    );

    const enableAppendSkillsCheckbox = (
        <PlanRoutePlanServantEditDialogEnabledCheckbox
            enhancement='appendSkills'
            label='Append Skills'
            multiEditMode={multiEditMode}
            value={enabled.appendSkills}
            onChange={handleEnableCheckboxChange}
        />
    );

    const levelField = (
        <ServantLevelInputField
            level={String(level || '')}
            ascension={String(level)}
            gameServant={targetGameServant}
            label='Level'
            helperText={generateCurrentTextLabel(targetMasterServant?.level)}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleLevelAscensionInputChange}
        />
    );

    const ascensionField = (
        <ServantAscensionInputField
            level={String(level || '')}
            ascension={String(ascension)}
            gameServant={targetGameServant}
            label='Ascension'
            helperText={generateCurrentTextLabel(targetMasterServant?.ascension)}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleLevelAscensionInputChange}
        />
    );

    const fouHpField = (
        <ServantFouInputField
            value={String(fouHp ?? '')}
            set='fouHp'
            label='HP Fou'
            helperText={generateCurrentTextLabel(targetMasterServant?.fouHp)}
            multiEditMode={multiEditMode}
            onChange={handleFouInputChange}
            onBlur={handleInputBlurEvent}
        />
    );

    const fouAtkField = (
        <ServantFouInputField
            value={String(fouAtk ?? '')}
            set='fouAtk'
            label='ATK Fou'
            helperText={generateCurrentTextLabel(targetMasterServant?.fouAtk)}
            multiEditMode={multiEditMode}
            onChange={handleFouInputChange}
            onBlur={handleInputBlurEvent}
        />
    );

    const skill1Field = (
        <ServantSkillInputField
            value={String(skills[1] || '')}
            set='skills'
            slot={1}
            label='Skill'
            helperText={generateCurrentTextLabel(targetMasterServant?.skills[1])}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
        />
    );

    const skill2Field = (
        <ServantSkillInputField
            value={String(skills[2] || '')}
            set='skills'
            slot={2}
            label='Skill'
            helperText={generateCurrentTextLabel(targetMasterServant?.skills[2])}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
        />
    );

    const skill3Field = (
        <ServantSkillInputField
            value={String(skills[3] || '')}
            set='skills'
            slot={3}
            label='Skill'
            helperText={generateCurrentTextLabel(targetMasterServant?.skills[3])}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
        />
    );

    const appendSkill1Field = (
        <ServantSkillInputField
            value={String(appendSkills[1] || '')}
            set='appendSkills'
            slot={1}
            label='Append'
            helperText={generateCurrentTextLabel(targetMasterServant?.appendSkills[1])}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
        />
    );

    const appendSkill2Field = (
        <ServantSkillInputField
            value={String(appendSkills[2] || '')}
            set='appendSkills'
            slot={2}
            label='Append'
            helperText={generateCurrentTextLabel(targetMasterServant?.appendSkills[2])}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
        />
    );

    const appendSkill3Field = (
        <ServantSkillInputField
            value={String(appendSkills[3] || '')}
            set='appendSkills'
            slot={3}
            label='Append'
            helperText={generateCurrentTextLabel(targetMasterServant?.appendSkills[3])}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
        />
    );

    //#endregion


    //#region Main component rendering

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <div className={`${StyleClassPrefix}-checkbox-container`}>
                    {enableAscensionsCheckbox}
                </div>
                <InputFieldContainer>
                    {levelField}
                </InputFieldContainer>
                <InputFieldContainer>
                    {ascensionField}
                </InputFieldContainer>
                <ServantLevelQuickToggleButtons
                    className={`${StyleClassPrefix}-toggle-button-group`}
                    maxNaturalLevel={targetGameServant?.maxLevel || 90}
                    onClick={handleLevelQuickToggleClick}
                    ignoreTabNavigation
                />
            </div>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <div className={`${StyleClassPrefix}-checkbox-container`}>
                    {enableFousCheckbox}
                </div>
                <InputFieldContainer>
                    {fouHpField}
                </InputFieldContainer>
                <InputFieldContainer>
                    {fouAtkField}
                </InputFieldContainer>
                <ServantFouQuickToggleButtons
                    className={`${StyleClassPrefix}-toggle-button-group`}
                    onClick={handleFouQuickToggleClick}
                    ignoreTabNavigation
                />
            </div>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <div className={`${StyleClassPrefix}-checkbox-container`}>
                    {enableSkillsCheckbox}
                </div>
                <InputFieldContainer>
                    {skill1Field}
                </InputFieldContainer>
                <InputFieldContainer>
                    {skill2Field}
                </InputFieldContainer>
                <InputFieldContainer>
                    {skill3Field}
                </InputFieldContainer>
                <ServantSkillQuickToggleButtons
                    className={`${StyleClassPrefix}-toggle-button-group`}
                    skillSet='skills'
                    leftToggleTarget={1}
                    centerToggleTarget={9}
                    rightToggleTarget={10}
                    ignoreTabNavigation
                    onClick={handleSkillQuickToggleClick}
                />
            </div>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <div className={`${StyleClassPrefix}-checkbox-container`}>
                    {enableAppendSkillsCheckbox}
                </div>
                <InputFieldContainer>
                    {appendSkill1Field}
                </InputFieldContainer>
                <InputFieldContainer>
                    {appendSkill2Field}
                </InputFieldContainer>
                <InputFieldContainer>
                    {appendSkill3Field}
                </InputFieldContainer>
                <ServantSkillQuickToggleButtons
                    className={`${StyleClassPrefix}-toggle-button-group`}
                    skillSet='appendSkills'
                    leftToggleTarget={1}
                    centerToggleTarget={9}
                    rightToggleTarget={10}
                    ignoreTabNavigation
                    onClick={handleSkillQuickToggleClick}
                />
            </div>
        </Box>
    );

});
