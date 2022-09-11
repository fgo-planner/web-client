import { GameServantConstants } from '@fgo-planner/data-core';
import { BaseTextFieldProps, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';
import { MasterServantUpdateIndeterminateValue as IndeterminateValue } from '../../../types/internal';

type SkillSet = 'skills' | 'appendSkills';

type SkillSlot = 1 | 2 | 3;

type Props = {
    allowEmpty?: boolean;
    disabled?: boolean;
    /**
     * @deprecated
     */
    formId?: string;
    label?: string;
    multiEditMode?: boolean;
    name: string;
    onChange: (name: string, skillSet: SkillSet, slot: SkillSlot, value: string, pushChanges: boolean) => void;
    skillSet: SkillSet,
    slot: SkillSlot,
    value: string;
    variant?: BaseTextFieldProps['variant'];
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
        name,
        onChange,
        skillSet,
        slot,
        value,
        variant
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        const { name, value } = event.target;
        onChange(name, skillSet, slot, value, true);
    }, [onChange, skillSet, slot]);

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
                {allowEmpty && <option value=''>{'\u2014'}</option>}
                {GameServantConstants.SkillLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

});
