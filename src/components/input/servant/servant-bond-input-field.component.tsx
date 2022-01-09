import { BaseTextFieldProps, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';
import { GameServantConstants } from '../../../constants';

type Props = {
    value: string;
    variant?: BaseTextFieldProps['variant'];
    formId: string;
    label?: string;
    name: string;
    allowEmpty?: boolean;
    disabled?: boolean;
    onChange: (name: string, value: string, pushChanges: boolean) => void;
};

const DefaultLabel = 'Bond';

/**
 * Input field for servant's bond level.
 */
export const ServantBondInputField = React.memo((props: Props) => {

    const {
        value,
        variant,
        formId,
        label,
        name,
        allowEmpty,
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
                {allowEmpty && <option value=''>{'\u2014'}</option>}
                {GameServantConstants.BondLevels.map(value => (
                    <option key={value} value={value}>
                        {value}
                    </option>
                ))}
            </Select>
        </FormControl>
    );

});
