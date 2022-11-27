import { InstantiatedServantConstants, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
import { BaseTextFieldProps, FormControl, FormHelperText, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';
import { FormConstants } from '../../../constants';

type Props = {
    allowEmpty?: boolean;
    disabled?: boolean;
    /**
     * @deprecated
     */
    formId?: string;
    helperText?: string;
    label?: string;
    multiEditMode?: boolean;
    onChange: (value: string, pushChanges: boolean) => void;
    value: string;
    variant?: BaseTextFieldProps['variant'];
};

const FieldName = 'bondLevel';

const DefaultLabel = 'Bond';

const IndeterminateDisplayText = '?';

const BlankDisplayText = '\u2014';

/**
 * Input field for a servant's bond level. This is currently only applicable to
 * master servants.
 */
export const ServantBondInputField = React.memo((props: Props) => {

    const {
        allowEmpty,
        disabled,
        formId,
        helperText,
        label,
        multiEditMode,
        onChange,
        value,
        variant
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        let value = event.target.value;
        /**
         * If the blank option was selected, convert it back to an empty string before
         * calling the `onChange` callback.
         */
        if (value === FormConstants.BlankOptionValue) {
            value = '';
        }
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
                value={value || FormConstants.BlankOptionValue}
                onChange={handleChange}
                disabled={disabled}
            >
                {multiEditMode &&
                    <option key={IndeterminateValue} value={IndeterminateValue}>
                        {IndeterminateDisplayText}
                    </option>
                }
                {allowEmpty && 
                    <option key={FormConstants.BlankOptionValue} value={FormConstants.BlankOptionValue}>
                        {BlankDisplayText}
                    </option>
                }
                {InstantiatedServantConstants.BondLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
            <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
    );

});
