import { InstantiatedServantConstants, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
import { BaseTextFieldProps, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';

type Props = {
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

const FieldName = 'np';

const DefaultLabel = 'NP Level';

const IndeterminateDisplayText = '?';

/**
 * Input field for a servant's NP level. This is currently only applicable to
 * master servants.
 */
export const ServantNpLevelInputField = React.memo((props: Props) => {

    const {
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
                {InstantiatedServantConstants.NoblePhantasmLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

});
