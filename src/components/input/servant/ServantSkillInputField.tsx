import { InstantiatedServantConstants, InstantiatedServantSkillSet, InstantiatedServantSkillSlot, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
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
    set: InstantiatedServantSkillSet,
    slot: InstantiatedServantSkillSlot,
    value: string;
    variant?: BaseTextFieldProps['variant'];
    onChange: (set: InstantiatedServantSkillSet, slot: InstantiatedServantSkillSlot, value: string, pushChanges: boolean) => void;
};

const DefaultLabel = 'Skill';

const IndeterminateDisplayText = '?';

/**
 * Input field for a servant's skill level. This is applicable to both master
 * and planned servants.
 */
export const ServantSkillInputField = React.memo((props: Props) => {

    const {
        allowEmpty,
        disabled,
        formId,
        label,
        multiEditMode,
        set,
        slot,
        value,
        variant,
        onChange
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        const value = event.target.value;
        onChange(set, slot, value, true);
    }, [onChange, set, slot]);

    const fieldName = `${set}-${slot}`;

    const fieldId = formId ? `${formId}-${fieldName}` : fieldName;

    const fieldLabel = `${label || DefaultLabel} ${slot}`;

    return (
        <FormControl variant={variant} fullWidth>
            <InputLabel htmlFor={fieldName} shrink>{label || DefaultLabel}</InputLabel>
            <Select
                native
                id={fieldId}
                name={fieldName}
                label={fieldLabel}
                value={value}
                onChange={handleChange}
                disabled={disabled}
            >
                {multiEditMode && <option key={IndeterminateValue} value={IndeterminateValue}>{IndeterminateDisplayText}</option>}
                {allowEmpty && <option value=''>{'\u2014'}</option>}
                {InstantiatedServantConstants.SkillLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

});
