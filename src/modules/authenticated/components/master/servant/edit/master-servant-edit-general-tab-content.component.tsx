import { GameServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ChangeEvent, useCallback } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { MasterServantBondInputField } from '../../../../../../components/input/servant/master/master-servant-bond-input-field.component';
import { MasterServantNpLevelInputField } from '../../../../../../components/input/servant/master/master-servant-np-level-input-field.component';
import { MasterServantSummonDateInputField } from '../../../../../../components/input/servant/master/master-servant-summon-date-input-field.component';
import { MasterServantSummonedCheckbox } from '../../../../../../components/input/servant/master/master-servant-summoned-checkbox.component';
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

const StyleClassPrefix = 'MasterServantEditGeneralTabContent';

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

export const MasterServantEditGeneralTabContent = React.memo((props: Props) => {

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
        bondLevel,
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

    const handleBondInputChange = useCallback((_, value: string, pushChanges = false): void => {
        if (!value) {
            editData.bondLevel = undefined;
        } else {
            editData.bondLevel = Number(value) as MasterServantBondLevel | -1;
        }
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [editData, forceUpdate, pushStatsChange]);

    const handleInputChange = useCallback((name: string, value: string, pushChanges = false): void => {
        // TODO Maybe have a separate handler for each stat.
        (masterServant as any)[name] = value ? Number(value) : undefined;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, masterServant, pushStatsChange]);

    const handleSummonedCheckboxChange = useCallback((_, value: boolean | undefined, pushChanges = false): void => {
        masterServant.summoned = value;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, masterServant, pushStatsChange]);

    const handleSummonDateInputChange = useCallback((_, value: number | undefined, pushChanges = false): void => {
        masterServant.summonDate = value;
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

    // TODO Add inputs for `summoned` and `summonDate`.

    const summonedField = (
        <MasterServantSummonedCheckbox
            value={masterServant.summoned}
            name='summoned'
            multiEditMode={multiEditMode}
            onChange={handleSummonedCheckboxChange}
            disabled={readonly}
        />
    );

    const summonDateField = (
        <MasterServantSummonDateInputField
            value={masterServant.summonDate}
            name='summonDate'
            multiEditMode={multiEditMode}
            onChange={handleSummonDateInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const npField = (
        <MasterServantNpLevelInputField
            value={String(masterServant.np ?? '')}
            label='NP Level'
            name='np'
            multiEditMode={multiEditMode}
            onChange={handleInputChange}
            disabled={readonly}
        />
    );

    const bondField = (
        <MasterServantBondInputField
            value={String(bondLevel ?? '')}
            label='Bond'
            name='bondLevel'
            allowEmpty
            multiEditMode={multiEditMode}
            onChange={handleBondInputChange}
            disabled={readonly}
        />
    );

    //#endregion


    //#region Main component rendering

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    {summonedField}
                </InputFieldContainer>
                <InputFieldContainer>
                    {summonDateField}
                </InputFieldContainer>
            </div>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    {npField}
                </InputFieldContainer>
            </div>
            <div className={`${StyleClassPrefix}-input-field-group`}>
                <InputFieldContainer>
                    {bondField}
                </InputFieldContainer>
            </div>
        </Box>
    );

    //#endregion

});
