import { BaseTextFieldProps, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';
import { GameServantConstants } from '../../../constants';

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
    name: string;
    onChange: (name: string, skillSet: SkillSet, slot: SkillSlot, value: string, pushChanges: boolean) => void;
    skillSet: SkillSet,
    slot: SkillSlot,
    value: string;
    variant?: BaseTextFieldProps['variant'];
};

const DefaultLabel = 'Skill';

/**
 * Input field for a servant's skill level.
 */
export const ServantSkillInputField = React.memo((props: Props) => {

    const {
        allowEmpty,
        disabled,
        formId,
        label,
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
