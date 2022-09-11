import { MasterServantConstants, MasterServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
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
    name: string;
    onChange: (name: string, value: string, pushChanges: boolean) => void;
    value: string;
    variant?: BaseTextFieldProps['variant'];
};

const DefaultLabel = 'NP Level';

const IndeterminateDisplayText = '?';

/**
 * Input field for a servant's NP level. This is currently only applicable to
 * master servants.
 */
export const MasterServantNpLevelInputField = React.memo((props: Props) => {

    const {
        disabled,
        formId,
        label,
        multiEditMode,
        name,
        onChange,
        value,
        variant
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        const { name, value } = event.target;
        onChange(name, value, true);
    }, [onChange]);

    const fieldId = formId ? `${formId}-${name}` : name;

    return (
        <FormControl variant={variant} fullWidth>
            <InputLabel htmlFor={name} shrink>{label || DefaultLabel}</InputLabel>
            <Select
                native
                id={fieldId}
                name={name}
                label={label || DefaultLabel}
                value={value}
                onChange={handleChange}
                disabled={disabled}
            >
                {multiEditMode && <option key={IndeterminateValue} value={IndeterminateValue}>{IndeterminateDisplayText}</option>}
                {MasterServantConstants.NoblePhantasmLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

});
