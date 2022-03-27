import { GameServant, MasterServantAscensionLevel, MasterServantSkillLevel } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { useCallback } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { ServantAscensionInputField } from '../../../../../../components/input/servant/servant-ascension-input-field.component';
import { ServantFouInputField } from '../../../../../../components/input/servant/servant-fou-input-field.component';
import { ServantLevelInputField } from '../../../../../../components/input/servant/servant-level-input-field.component';
import { ServantSkillInputField } from '../../../../../../components/input/servant/servant-skill-input-field.component';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
import { Immutable } from '../../../../../../types/internal';
import { MasterServantEditData } from './master-servant-edit-data.type';

type Props = {
    /**
     * The servant data to edit. This will be modified directly, so provide a clone
     * if modification to the original object is not desired.
     */
    editData: MasterServantEditData;
    /**
     * The game servant data that corresponds to the servant being edited. This
     * should be set to `undefined` if and only if multiple servants are being
     * edited.
     */
    gameServant?: Immutable<GameServant>;
    multiEditMode?: boolean;
    onChange: (data: MasterServantEditData) => void;
    readonly?: boolean;
    showAppendSkills?: boolean;
};

type SkillSet = 'skills' | 'appendSkills';

type SkillSlot = 1 | 2 | 3;

const StyleClassPrefix = 'MasterServantEditEnhancementsTabContent';

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

export const MasterServantEditEnhancementsTabContent = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const {
        editData,
        gameServant,
        multiEditMode,
        onChange,
        readonly,
        showAppendSkills
    } = props;

    const {
        isNewServant,
        masterServant,
        unlockedCostumes
    } = editData;

    /**
     * Notifies the parent component of stats change by invoking the `onChange`
     * callback function.
     */
    const pushStatsChange = useCallback((): void => {
        onChange?.(editData);
    }, [onChange, editData]);


    //#region Input event handlers

    const handleLevelAscensionInputChange = useCallback((_, level: string, ascension: string, pushChanges = false): void => {
        masterServant.level = Number(level);
        masterServant.ascension = Number(ascension) as MasterServantAscensionLevel;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, masterServant, pushStatsChange]);

    const handleSkillInputChange = useCallback((_, skillSet: SkillSet, slot: SkillSlot, value: string, pushChanges = false): void => {
        masterServant[skillSet][slot] = value ? Number(value) as MasterServantSkillLevel : undefined;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, masterServant, pushStatsChange]);

    const handleInputChange = useCallback((name: string, value: string, pushChanges = false): void => {
        // TODO Maybe have a separate handler for each stat.
        (masterServant as any)[name] = value ? Number(value) : undefined;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, masterServant, pushStatsChange]);

    const handleInputBlurEvent = useCallback((): void => {
        pushStatsChange();
        forceUpdate();
    }, [forceUpdate, pushStatsChange]);

    //#endregion


    //#region Input fields

    const levelField = (
        <ServantLevelInputField
            level={String(masterServant.level || '')}
            ascension={String(masterServant.level)}
            gameServant={gameServant}
            label='Level'
            name='level'
            multiEditMode={multiEditMode}
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const ascensionField = (
        <ServantAscensionInputField
            level={String(masterServant.level || '')}
            ascension={String(masterServant.ascension)}
            gameServant={gameServant}
            label='Ascension'
            name='ascension'
            multiEditMode={multiEditMode}
            onChange={handleLevelAscensionInputChange}
            disabled={readonly}
        />
    );

    const fouHpField = (
        <ServantFouInputField
            value={String(masterServant.fouHp ?? '')}
            label='HP Fou'
            name='fouHp'
            multiEditMode={multiEditMode}
            onChange={handleInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const fouAtkField = (
        <ServantFouInputField
            value={String(masterServant.fouAtk ?? '')}
            label='ATK Fou'
            name='fouAtk'
            multiEditMode={multiEditMode}
            onChange={handleInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const skill1Field = (
        <ServantSkillInputField
            value={String(masterServant.skills[1] || '')}
            label='Skill 1'
            name='skill1'
            skillSet='skills'
            slot={1}
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const skill2Field = (
        <ServantSkillInputField
            value={String(masterServant.skills[2] || '')}
            label='Skill 2'
            name='skill2'
            skillSet='skills'
            slot={2}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const skill3Field = (
        <ServantSkillInputField
            value={String(masterServant.skills[3] || '')}
            label='Skill 3'
            name='skill3'
            skillSet='skills'
            slot={3}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const appendSkill1Field = (
        <ServantSkillInputField
            value={String(masterServant.appendSkills[1] || '')}
            label='Append 1'
            name='appendSkill1'
            skillSet='appendSkills'
            slot={1}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const appendSkill2Field = (
        <ServantSkillInputField
            value={String(masterServant.appendSkills[2] || '')}
            label='Append 2'
            name='appendSkill2'
            skillSet='appendSkills'
            slot={2}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    const appendSkill3Field = (
        <ServantSkillInputField
            value={String(masterServant.appendSkills[3] || '')}
            label='Append 3'
            name='appendSkill3'
            skillSet='appendSkills'
            slot={3}
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleSkillInputChange}
            disabled={readonly}
        />
    );

    //#endregion


    //#region Main component rendering

    if (!gameServant && !multiEditMode) {
        console.error('MasterServantEditEnhancementsTabContent: gameServant must be provided when editing single servant');
        return null;
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    {levelField}
                </InputFieldContainer>
                <InputFieldContainer>
                    {ascensionField}
                </InputFieldContainer>
            </div>
            <div className={`${StyleClassPrefix}-input-field-group`}>
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
                </div>
            )}
        </Box>
    );

});
