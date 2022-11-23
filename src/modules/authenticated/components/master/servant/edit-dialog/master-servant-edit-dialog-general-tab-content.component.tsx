import { InstantiatedServantBondLevel, InstantiatedServantNoblePhantasmLevel, InstantiatedServantUpdateBoolean, InstantiatedServantUpdateIndeterminate as Indeterminate, InstantiatedServantUpdateNumber, MasterServantUpdate } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { useCallback } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/input-field-container.component';
import { MasterServantBondInputField } from '../../../../../../components/input/servant/master/master-servant-bond-input-field.component';
import { MasterServantNpLevelInputField } from '../../../../../../components/input/servant/master/master-servant-np-level-input-field.component';
import { MasterServantSummonDateInputField } from '../../../../../../components/input/servant/master/master-servant-summon-date-input-field.component';
import { MasterServantSummonedCheckbox } from '../../../../../../components/input/servant/master/master-servant-summoned-checkbox.component';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';

type Props = {
    /**
     * The update payload for editing. This will be modified directly.
     */
    masterServantUpdate: MasterServantUpdate;
    multiEditMode?: boolean;
    readonly?: boolean;
    showAppendSkills?: boolean;
};

const StyleClassPrefix = 'MasterServantEditDialogGeneralTabContent';

const StyleProps = (theme: SystemTheme) => ({
    overflowY: 'auto',
    height: '100%',
    boxSizing: 'border-box',
    px: 6,
    pt: 8,
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

export const MasterServantEditDialogGeneralTabContent = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const {
        masterServantUpdate,
        multiEditMode,
        readonly
    } = props;


    //#region Input event handlers

    const handleBondInputChange = useCallback((value: string): void => {
        if (!value) {
            masterServantUpdate.bondLevel = null;
        } else {
            masterServantUpdate.bondLevel = Number(value) as InstantiatedServantUpdateNumber<InstantiatedServantBondLevel>;
        }
        forceUpdate();
    }, [forceUpdate, masterServantUpdate]);

    const handleNpInputChange = useCallback((value: string): void => {
        masterServantUpdate.np = Number(value) as InstantiatedServantUpdateNumber<InstantiatedServantNoblePhantasmLevel>;
        forceUpdate();
    }, [forceUpdate, masterServantUpdate]);

    const handleSummonedCheckboxChange = useCallback((value: InstantiatedServantUpdateBoolean): void => {
        masterServantUpdate.summoned = value;
        forceUpdate();
    }, [forceUpdate, masterServantUpdate]);

    const handleSummonDateInputChange = useCallback((value: number | Indeterminate | null ): void => {
        masterServantUpdate.summonDate = value;
        forceUpdate();
    }, [forceUpdate, masterServantUpdate]);


    const handleInputBlurEvent = useCallback((): void => {
        forceUpdate();
    }, [forceUpdate]);

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
            multiEditMode={multiEditMode}
            onChange={handleSummonedCheckboxChange}
            disabled={readonly}
        />
    );

    const summonDateField = (
        <MasterServantSummonDateInputField
            value={summonDate}
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
            multiEditMode={multiEditMode}
            onChange={handleNpInputChange}
            disabled={readonly}
        />
    );

    const bondField = (
        <MasterServantBondInputField
            value={String(bondLevel ?? '')}
            label='Bond'
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
