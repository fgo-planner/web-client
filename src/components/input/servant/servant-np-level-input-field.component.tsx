import { BaseTextFieldProps, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';
import { GameServantConstants } from '../../../constants';

type Props = {
    value: string;
    variant?: BaseTextFieldProps['variant'];
    formId: string;
    label?: string;
    name: string;
    disabled?: boolean;
    onChange: (name: string, value: string, pushChanges: boolean) => void;
};

const DefaultLabel = 'NP Level';

/**
 * Input field for servant's NP level.
 */
export const ServantNpLevelInputField = React.memo((props: Props) => {

    const {
        value,
        variant,
        formId,
        label,
        name,
        disabled,
        onChange
    } = props;

    const handleChange = useCallback((event: SelectChangeEvent<string>): void => {
        const { name, value } = event.target;
        onChange(name, value, true);
    }, [onChange]);

    return (
        <FormControl variant={variant} fullWidth>
            <InputLabel htmlFor={name} shrink>{label || DefaultLabel}</InputLabel>
            <Select
                native
                id={`${formId}-${name}`}
                name={name}
                label={label || DefaultLabel}
                value={value}
                onChange={handleChange}
                disabled={disabled}
            >
                {GameServantConstants.NoblePhantasmLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

});
