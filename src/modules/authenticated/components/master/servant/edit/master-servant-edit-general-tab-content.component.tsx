import { GameServant, MasterServantBondLevel, MasterServantNoblePhantasmLevel } from '@fgo-planner/data-types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { useCallback } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { MasterServantBondInputField } from '../../../../../../components/input/servant/master/master-servant-bond-input-field.component';
import { MasterServantNpLevelInputField } from '../../../../../../components/input/servant/master/master-servant-np-level-input-field.component';
import { MasterServantSummonDateInputField } from '../../../../../../components/input/servant/master/master-servant-summon-date-input-field.component';
import { MasterServantSummonedCheckbox } from '../../../../../../components/input/servant/master/master-servant-summoned-checkbox.component';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
import { Immutable, MasterServantUpdate, MasterServantUpdateIndeterminate as Indeterminate, MasterServantUpdateIndeterminateValue as IndeterminateValue } from '../../../../../../types/internal';

type Props = {
    /**
     * The game servant data that corresponds to the servant being edited. This
     * should be set to `undefined` if and only if multiple servants are being
     * edited.
     */
    gameServant?: Immutable<GameServant>;
    /**
     * The update payload for editing. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     */
    masterServantUpdate: MasterServantUpdate;
    multiEditMode?: boolean;
    onChange: (update: MasterServantUpdate) => void;
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
        masterServantUpdate,
        multiEditMode,
        onChange,
        readonly
    } = props;

    /**
     * Notifies the parent component of stats change by invoking the `onChange`
     * callback function.
     */
    const pushStatsChange = useCallback((): void => {
        onChange?.(masterServantUpdate);
    }, [onChange, masterServantUpdate]);


    //#region Input event handlers

    const handleBondInputChange = useCallback((_: string, value: string, pushChanges = false): void => {
        if (!value) {
            masterServantUpdate.bondLevel = undefined;
        } else if (value === IndeterminateValue) {
            masterServantUpdate.bondLevel = IndeterminateValue;
        } else {
            masterServantUpdate.bondLevel = Number(value) as MasterServantBondLevel;
        }
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, masterServantUpdate, pushStatsChange]);

    const handleNpInputChange = useCallback((_: string, value: string, pushChanges = false): void => {
        if (value === IndeterminateValue) {
            masterServantUpdate.np = IndeterminateValue;
        } else {
            masterServantUpdate.np = Number(value) as MasterServantNoblePhantasmLevel;
        }
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, masterServantUpdate, pushStatsChange]);

    const handleSummonedCheckboxChange = useCallback((_: string, value: boolean | Indeterminate, pushChanges = false): void => {
        masterServantUpdate.summoned = value;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, masterServantUpdate, pushStatsChange]);

    const handleSummonDateInputChange = useCallback((_: string, value: number | undefined | Indeterminate, pushChanges = false): void => {
        masterServantUpdate.summonDate = value;
        if (pushChanges) {
            pushStatsChange();
        }
        forceUpdate();
    }, [forceUpdate, masterServantUpdate, pushStatsChange]);


    const handleInputBlurEvent = useCallback((): void => {
        pushStatsChange();
        forceUpdate();
    }, [forceUpdate, pushStatsChange]);

    //#endregion


    //#region Input fields

    const {
        summoned,
        summonDate,
        np,
        bondLevel
    } = masterServantUpdate;

    const summonedField = (
        <MasterServantSummonedCheckbox
            value={summoned}
            name='summoned'
            multiEditMode={multiEditMode}
            onChange={handleSummonedCheckboxChange}
            disabled={readonly}
        />
    );

    const summonDateField = (
        <MasterServantSummonDateInputField
            value={summonDate}
            name='summonDate'
            label={summoned ? 'Summon date' : 'Planned summon date'}
            multiEditMode={multiEditMode}
            onChange={handleSummonDateInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const npField = (
        <MasterServantNpLevelInputField
            value={String(np ?? '')}
            label='NP Level'
            name='np'
            multiEditMode={multiEditMode}
            onChange={handleNpInputChange}
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
                <InputFieldContainer>
                    {bondField}
                </InputFieldContainer>
            </div>
        </Box>
    );

    //#endregion

});
