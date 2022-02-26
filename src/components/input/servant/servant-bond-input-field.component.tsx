import { BaseTextFieldProps, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import React, { useCallback } from 'react';
import { GameServantConstants } from '../../../constants';

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
    onChange: (name: string, value: string, pushChanges: boolean) => void;
    value: string;
    variant?: BaseTextFieldProps['variant'];
};

const DefaultLabel = 'Bond';

const IndeterminateDisplayText = '?';

/**
 * Input field for servant's bond level.
 */
export const ServantBondInputField = React.memo((props: Props) => {

    const {
        allowEmpty,
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
                {multiEditMode && <option key={-1} value={-1}>{IndeterminateDisplayText}</option>}
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
