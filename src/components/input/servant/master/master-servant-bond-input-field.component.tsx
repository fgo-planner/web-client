import { InstantiatedServantConstants, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
import { BaseTextFieldProps, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';

type Props = {
    allowEmpty?: boolean;
    disabled?: boolean;
    /**
     * @deprecated
     */
    formId?: string;
    label?: string;
    multiEditMode?: boolean;
    onChange: (value: string, pushChanges: boolean) => void;
    value: string;
    variant?: BaseTextFieldProps['variant'];
};

const FieldName = 'bondLevel';

const DefaultLabel = 'Bond';

const IndeterminateDisplayText = '?';

/**
 * Input field for a servant's bond level. This is currently only applicable to
 * master servants.
 */
export const MasterServantBondInputField = React.memo((props: Props) => {

    const {
        allowEmpty,
        disabled,
        formId,
        label,
        multiEditMode,
        onChange,
        value,
        variant
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        const value = event.target.value;
        onChange(value, true);
    }, [onChange]);

    const fieldId = formId ? `${formId}-${FieldName}` : FieldName;

    return (
        <FormControl variant={variant} fullWidth>
            <InputLabel htmlFor={FieldName} shrink>{label || DefaultLabel}</InputLabel>
            <Select
                native
                id={fieldId}
                name={FieldName}
                label={label || DefaultLabel}
                value={value}
                onChange={handleChange}
                disabled={disabled}
            >
                {multiEditMode && <option key={IndeterminateValue} value={IndeterminateValue}>{IndeterminateDisplayText}</option>}
                {allowEmpty && <option value=''>{'\u2014'}</option>}
                {InstantiatedServantConstants.BondLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

});
