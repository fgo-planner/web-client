import { InstantiatedServantConstants, InstantiatedServantSkillSet, InstantiatedServantSkillSlot, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
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
    set: InstantiatedServantSkillSet,
    slot: InstantiatedServantSkillSlot,
    value: string;
    variant?: BaseTextFieldProps['variant'];
    onChange: (set: InstantiatedServantSkillSet, slot: InstantiatedServantSkillSlot, value: string, pushChanges: boolean) => void;
};

const DefaultLabel = 'Skill';

const IndeterminateDisplayText = '?';

const BlankDisplayText = '\u2014';

/**
 * Input field for a servant's skill level. This is applicable to both master
 * and planned servants.
 */
export const ServantSkillInputField = React.memo((props: Props) => {

    const {
        allowEmpty,
        disabled,
        formId,
        helperText,
        label,
        multiEditMode,
        set,
        slot,
        value,
        variant,
        onChange
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
        onChange(set, slot, value, true);
    }, [onChange, set, slot]);

    const fieldName = `${set}-${slot}`;

    const fieldId = formId ? `${formId}-${fieldName}` : fieldName;

    const fieldLabel = `${label || DefaultLabel} ${slot}`;

    return (
        <FormControl variant={variant} fullWidth>
            <InputLabel htmlFor={fieldName} shrink>{fieldLabel || DefaultLabel}</InputLabel>
            <Select
                native
                id={fieldId}
                name={fieldName}
                label={fieldLabel}
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
                {InstantiatedServantConstants.SkillLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
            <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
    );

});
