import { Immutable, ImmutableArray } from '@fgo-planner/common-core';
import { GameServant, InstantiatedServantAscensionLevel, InstantiatedServantFouSet, InstantiatedServantSkillLevel, InstantiatedServantSkillSet, InstantiatedServantSkillSlot, InstantiatedServantUpdateNumber, MasterServantUpdate } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { useCallback } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/InputFieldContainer';
import { ServantAscensionInputField } from '../../../../../../components/input/servant/ServantAscensionInputField';
import { ServantFouInputField } from '../../../../../../components/input/servant/ServantFouInputField';
import { ServantFouQuickToggleButtons } from '../../../../../../components/input/servant/ServantFouQuickToggleButtons';
import { ServantLevelInputField } from '../../../../../../components/input/servant/ServantLevelInputField';
import { ServantLevelQuickToggleButtons } from '../../../../../../components/input/servant/ServantLevelQuickToggleButtons';
import { ServantSkillInputField } from '../../../../../../components/input/servant/ServantSkillInputField';
import { ServantSkillQuickToggleButtons } from '../../../../../../components/input/servant/ServantSkillQuickToggleButtons';
import { useForceUpdate } from '../../../../../../hooks/utils/useForceUpdate';

type Props = {
    /**
     * The servant update data. This object will be modified directly.
     */
    masterServantUpdate: MasterServantUpdate;
    multiEditMode: boolean;
    readonly?: boolean;
    targetGameServantsData: ImmutableArray<GameServant>;
};

const StyleClassPrefix = 'MasterServantEditDialogEnhancementsTabContent';

const StyleProps = (theme: SystemTheme) => ({
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
} as SystemStyleObject<SystemTheme>);

export const MasterServantEditDialogEnhancementsTabContent = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const {
        masterServantUpdate,
        multiEditMode,
        readonly,
        targetGameServantsData
    } = props;


    //#region Input event handlers

    const handleLevelAscensionInputChange = useCallback((level: string, ascension: string): void => {
        masterServantUpdate.level = Number(level);
        masterServantUpdate.ascension = Number(ascension) as InstantiatedServantAscensionLevel;
        forceUpdate();
    }, [forceUpdate, masterServantUpdate]);

    // eslint-disable-next-line max-len
    const handleSkillInputChange = useCallback((set: InstantiatedServantSkillSet, slot: InstantiatedServantSkillSlot, value: string): void => {
        if (!value) {
            masterServantUpdate[set][slot] = null;
        } else {
            const skillLevel = Number(value) as InstantiatedServantUpdateNumber<InstantiatedServantSkillLevel>;
            masterServantUpdate[set][slot] = skillLevel;
        }
        forceUpdate();
    }, [forceUpdate, masterServantUpdate]);

    const handleFouInputChange = useCallback((set: InstantiatedServantFouSet, value: string): void => {
        if (!value) {
            masterServantUpdate[set] = null;
        } else {
            masterServantUpdate[set] = Number(value);
        }
        forceUpdate();
    }, [forceUpdate, masterServantUpdate]);

    const handleInputBlurEvent = useCallback((): void => {
        forceUpdate();
    }, [forceUpdate]);

    const handleLevelQuickToggleClick = useCallback((level: number, ascension: InstantiatedServantAscensionLevel): void => {
        if (masterServantUpdate.ascension === ascension && masterServantUpdate.level === level) {
            return;
        }
        handleLevelAscensionInputChange(
            String(level),
            String(ascension)
        );
    }, [handleLevelAscensionInputChange, masterServantUpdate]);

    const handleFouQuickToggleClick = useCallback((value: number): void => {
        if (masterServantUpdate.fouHp === value && masterServantUpdate.fouAtk === value) {
            return;
        }
        masterServantUpdate.fouHp = value;
        masterServantUpdate.fouAtk = value;
        forceUpdate();
    }, [forceUpdate, masterServantUpdate]);

    // eslint-disable-next-line max-len
    const handleSkillQuickToggleClick = useCallback((value: InstantiatedServantSkillLevel | null, set: InstantiatedServantSkillSet): void => {
        const skillSet = masterServantUpdate[set];
        if (skillSet[1] === value && skillSet[2] === value && skillSet[3] === value) {
            return;
        }
        skillSet[1] = value;
        skillSet[2] = value;
        skillSet[3] = value;
        forceUpdate();
    }, [forceUpdate, masterServantUpdate]);

    //#endregion


    //#region Input fields

    const {
        level,
        ascension,
        fouAtk,
        fouHp,
        skills,
        appendSkills
    } = masterServantUpdate;

    let targetGameServant: Immutable<GameServant> | undefined;
    if (!multiEditMode) {
        /**
         * This can be empty during the initial render.
         */
        if (!targetGameServantsData.length) {
            return null;
        }
        targetGameServant = targetGameServantsData[0];
    }

    const levelField = (
        <ServantLevelInputField
            level={String(level || '')}
            ascension={String(ascension)}
            gameServant={targetGameServant}
            label='Level'
            multiEditMode={multiEditMode}
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const ascensionField = (
        <ServantAscensionInputField
            level={String(level || '')}
            ascension={String(ascension)}
            gameServant={targetGameServant}
            label='Ascension'
            multiEditMode={multiEditMode}
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const fouHpField = (
        <ServantFouInputField
            value={String(fouHp ?? '')}
            label='HP Fou'
            set='fouHp'
            multiEditMode={multiEditMode}
            onChange={handleFouInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const fouAtkField = (
        <ServantFouInputField
            value={String(fouAtk ?? '')}
            label='ATK Fou'
            set='fouAtk'
            multiEditMode={multiEditMode}
            onChange={handleFouInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const skill1Field = (
        <ServantSkillInputField
            value={String(skills[1] || '')}
            label='Skill'
            set='skills'
            slot={1}
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const skill2Field = (
        <ServantSkillInputField
            value={String(skills[2] || '')}
            label='Skill'
            set='skills'
            slot={2}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const skill3Field = (
        <ServantSkillInputField
            value={String(skills[3] || '')}
            label='Skill'
            set='skills'
            slot={3}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const appendSkill1Field = (
        <ServantSkillInputField
            value={String(appendSkills[1] || '')}
            label='Append'
            set='appendSkills'
            slot={1}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const appendSkill2Field = (
        <ServantSkillInputField
            value={String(appendSkills[2] || '')}
            label='Append'
            set='appendSkills'
            slot={2}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const appendSkill3Field = (
        <ServantSkillInputField
            value={String(appendSkills[3] || '')}
            label='Append'
            set='appendSkills'
            slot={3}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    //#endregion


    //#region Main component rendering

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-input-field-group`}>
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
                    disabled={readonly || multiEditMode}
                />
            </div>
            <div className={`${StyleClassPrefix}-input-field-group`}>
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
                <ServantSkillQuickToggleButtons
                    className={`${StyleClassPrefix}-toggle-button-group`}
                    skillSet='appendSkills'
                    leftToggleTarget={0}
                    centerToggleTarget={1}
                    rightToggleTarget={9}
                    ignoreTabNavigation
                    onClick={handleSkillQuickToggleClick}
                    disabled={readonly}
                />
            </div>
        </Box>
    );

});
