import { Immutable } from '@fgo-planner/common-core';
import { GameServant, InstantiatedServantAscensionLevel, InstantiatedServantSkillLevel, PlanServant } from '@fgo-planner/data-core';
import { Checkbox, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ChangeEvent, FocusEvent, useCallback } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { ServantAscensionInputField } from '../../../../../../components/input/servant/servant-ascension-input-field.component';
import { ServantFouInputField } from '../../../../../../components/input/servant/servant-fou-input-field.component';
import { ServantFouQuickToggleButtons } from '../../../../../../components/input/servant/servant-fou-quick-toggle-buttons.component';
import { ServantLevelInputField } from '../../../../../../components/input/servant/servant-level-input-field.component';
import { ServantLevelQuickToggleButtons } from '../../../../../../components/input/servant/servant-level-quick-toggle-buttons.component';
import { ServantSkillInputField } from '../../../../../../components/input/servant/servant-skill-input-field.component';
import { ServantSkillQuickToggleButtons } from '../../../../../../components/input/servant/servant-skill-quick-toggle-buttons.component';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';

type Props = {
    /**
     * The game data for the planned servant that is being edited.
     */
    gameServant: Immutable<GameServant>;
    onChange: (planServant: PlanServant) => void;
    /**
     * The planned servant that is being edited. This will be modified directly, so
     * provide a clone if modification to the original object is not desired.
     * 
     * @deprecated
     */
    planServant: PlanServant;
    // planServantUpdate: PlanServantUpdate;
    readonly?: boolean;
    showAppendSkills?: boolean;
};

type SkillSet = 'skills' | 'appendSkills';

type SkillSlot = 1 | 2 | 3;

type FouStat = 'fouHp' | 'fouAtk';

const TooltipEnterDelay = 250;

const StyleClassPrefix = 'PlanServantEditEnhancementsTabContent';

const StyleProps = (theme: Theme) => ({
    [`& .${StyleClassPrefix}-toggle-button-group`]: {
        width: 128,
        height: 56,
        ml: 2
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

export const PlanServantEditEnhancementsTabContent = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const {
        gameServant,
        onChange,
        planServant,
        // planServantUpdate,
        readonly,
        showAppendSkills
    } = props;

    /**
     * Notifies the parent component of stats change by invoking the `onChange`
     * callback function.
     */
    const pushStatsChange = useCallback((): void => {
        onChange?.(planServant);
    }, [onChange, planServant]);


    //#region Input event handlers

    const handleEnableCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const { name, checked } = event.target;
        (planServant.enabled as any)[name] = checked;
        pushStatsChange();
        forceUpdate();
    }, [forceUpdate, planServant, pushStatsChange]);

    const handleLevelAscensionInputChange = useCallback((_name: string, level: string, ascension: string, pushChanges = false): void => {
        planServant.level = Number(level);
        planServant.ascension = Number(ascension) as InstantiatedServantAscensionLevel;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, planServant, pushStatsChange]);

    const handleSkillInputChange = useCallback((_name: any, set: SkillSet, slot: SkillSlot, value: string, pushChanges = false): void => {
        planServant[set][slot] = value ? Number(value) as InstantiatedServantSkillLevel : undefined;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, planServant, pushStatsChange]);

    const handleFouInputChange = useCallback((_: string, stat: FouStat, value: string): void => {
        planServant[stat] = value ? Number(value) : undefined;
        forceUpdate();
    }, [forceUpdate, planServant]);

    const handleInputBlurEvent = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        pushStatsChange();
        forceUpdate();
    }, [forceUpdate, pushStatsChange]);

    const handleLevelQuickToggleClick = useCallback((level: number, ascension: InstantiatedServantAscensionLevel): void => {
        if (planServant.ascension === ascension && planServant.level === level) {
            return;
        }
        handleLevelAscensionInputChange(
            'TODO The the name param should no longer be needed',
            String(level),
            String(ascension),
            true
        );
    }, [handleLevelAscensionInputChange, planServant.ascension, planServant.level]);

    const handleFouQuickToggleClick = useCallback((value: number): void => {
        if (planServant.fouHp === value && planServant.fouAtk === value) {
            return;
        }
        planServant.fouHp = value;
        planServant.fouAtk = value;
        pushStatsChange();
        forceUpdate();
    }, [forceUpdate, planServant, pushStatsChange]);

    // eslint-disable-next-line max-len
    const handleSkillQuickToggleClick = useCallback((value: InstantiatedServantSkillLevel | null, stat: 'skills' | 'appendSkills'): void => {
        const skillSet = planServant[stat];
        const skillLevel = value ?? undefined;
        if (skillSet[1] === skillLevel && skillSet[2] === skillLevel && skillSet[3] === skillLevel) {
            return;
        }
        skillSet[1] = skillLevel;
        skillSet[2] = skillLevel;
        skillSet[3] = skillLevel;
        pushStatsChange();
        forceUpdate();
    }, [forceUpdate, planServant, pushStatsChange]);

    //#endregion


    //#region Input fields

    const { enabled } = planServant;

    const enableAscensionsCheckbox = (
        <Tooltip
            title={`Ascensions/levels ${enabled.ascensions ? 'enabled' : 'disabled'}`}
            enterDelay={TooltipEnterDelay}
        >
            <Checkbox
                name='ascensions'
                checked={enabled.ascensions}
                onChange={handleEnableCheckboxChange}
                disabled={readonly}
            />
        </Tooltip>
    );

    const enableSkillsCheckbox = (
        <Tooltip
            title={`Ascensions/levels ${enabled.skills ? 'enabled' : 'disabled'}`}
            enterDelay={TooltipEnterDelay}
        >
            <Checkbox
                name='skills'
                checked={enabled.skills}
                onChange={handleEnableCheckboxChange}
                disabled={readonly}
            />
        </Tooltip>
    );

    const enableAppendSkillsCheckbox = (
        <Tooltip
            title={`Ascensions/levels ${enabled.appendSkills ? 'enabled' : 'disabled'}`}
            enterDelay={TooltipEnterDelay}
        >
            <Checkbox
                name='appendSkills'
                checked={enabled.appendSkills}
                onChange={handleEnableCheckboxChange}
                disabled={readonly}
            />
        </Tooltip>
    );

    const levelField = (
        <ServantLevelInputField
            level={String(planServant.level || '')}
            ascension={String(planServant.level)}
            gameServant={gameServant}
            label='Level'
            name='level'
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const ascensionField = (
        <ServantAscensionInputField
            level={String(planServant.level || '')}
            ascension={String(planServant.ascension)}
            gameServant={gameServant}
            label='Ascension'
            name='ascension'
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const fouHpField = (
        <ServantFouInputField
            value={String(planServant.fouHp ?? '')}
            label='HP Fou'
            name='fouHp'
            stat='fouHp'
            onChange={handleFouInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const fouAtkField = (
        <ServantFouInputField
            value={String(planServant.fouAtk ?? '')}
            label='ATK Fou'
            name='fouAtk'
            stat='fouAtk'
            onChange={handleFouInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const skill1Field = (
        <ServantSkillInputField
            value={String(planServant.skills[1] || '')}
            label='Skill 1'
            name='skill1'
            skillSet='skills'
            slot={1}
            allowEmpty
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const skill2Field = (
        <ServantSkillInputField
            value={String(planServant.skills[2] || '')}
            label='Skill 2'
            name='skill2'
            skillSet='skills'
            slot={2}
            allowEmpty
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const skill3Field = (
        <ServantSkillInputField
            value={String(planServant.skills[3] || '')}
            label='Skill 3'
            name='skill3'
            skillSet='skills'
            slot={3}
            allowEmpty
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const appendSkill1Field = (
        <ServantSkillInputField
            value={String(planServant.appendSkills[1] || '')}
            label='Append 1'
            name='appendSkill1'
            skillSet='appendSkills'
            slot={1}
            allowEmpty
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const appendSkill2Field = (
        <ServantSkillInputField
            value={String(planServant.appendSkills[2] || '')}
            label='Append 2'
            name='appendSkill2'
            skillSet='appendSkills'
            slot={2}
            allowEmpty
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const appendSkill3Field = (
        <ServantSkillInputField
            value={String(planServant.appendSkills[3] || '')}
            label='Append 3'
            name='appendSkill3'
            skillSet='appendSkills'
            slot={3}
            allowEmpty
            onChange={handleSkillInputChange}
            disabled={readonly}
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
                    maxNaturalLevel={gameServant.maxLevel}
                    onClick={handleLevelQuickToggleClick}
                    ignoreTabNavigation
                    disabled={readonly}
                />
            </div>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <div className={`${StyleClassPrefix}-checkbox-container`}>
                    {/* TODO Add a flag to enable/disable fous */}
                    <Checkbox />
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
                    disabled={readonly}
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
                    disabled={readonly}
                />
            </div>
            {showAppendSkills && (
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
                        disabled={readonly}
                    />
                </div>
            )}
        </Box>
    );

});
