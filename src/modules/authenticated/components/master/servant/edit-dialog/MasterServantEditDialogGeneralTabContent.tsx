import { InstantiatedServantBondLevel, InstantiatedServantNoblePhantasmLevel, InstantiatedServantUpdateBoolean, InstantiatedServantUpdateIndeterminate as Indeterminate, InstantiatedServantUpdateNumber, MasterServantUpdate } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { useCallback } from 'react';
import { InputFieldContainer, StyleClassPrefix as InputFieldContainerStyleClassPrefix } from '../../../../../../components/input/InputFieldContainer';
import { ServantBondInputField } from '../../../../../../components/input/servant/ServantBondInputField';
import { ServantNpLevelInputField } from '../../../../../../components/input/servant/ServantNpLevelInputField';
import { ServantSummonDateInputField } from '../../../../../../components/input/servant/ServantSummonDateInputField';
import { ServantSummonedCheckbox } from '../../../../../../components/input/servant/ServantSummonedCheckbox';
import { useForceUpdate } from '../../../../../../hooks/utils/useForceUpdate';

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
        <ServantSummonedCheckbox
            value={summoned}
            multiEditMode={multiEditMode}
            onChange={handleSummonedCheckboxChange}
            disabled={readonly}
        />
    );

    const summonDateField = (
        <ServantSummonDateInputField
            value={summonDate}
            label={summoned ? 'Summon date' : 'Planned summon date'}
            multiEditMode={multiEditMode}
            onChange={handleSummonDateInputChange}
            onBlur={handleInputBlurEvent}
            disabled={readonly}
        />
    );

    const npField = (
        <ServantNpLevelInputField
            value={String(np ?? '')}
            label='NP Level'
            multiEditMode={multiEditMode}
            onChange={handleNpInputChange}
            disabled={readonly}
        />
    );

    const bondField = (
        <ServantBondInputField
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
