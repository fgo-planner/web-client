import { BaseTextFieldProps, TextField } from '@mui/material';
import React, { ChangeEvent, FocusEvent, useCallback } from 'react';
import { GameServantConstants } from '../../../constants';
import { FormUtils } from '../../../utils/form.utils';

type Props = {
    value: string;
    variant?: BaseTextFieldProps['variant'];
    label?: string;
    name: string;
    disabled?: boolean;
    onChange: (name: string, value: string) => void;
    onBlur?: (event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
};

const DefaultLabel = 'Fou';

/**
 * Calculates the step size for the Fou number input fields based on the current
 * value of the field.
 *
 * Note that at 1000 Fou, the step size is calculated to be 20. This is correct
 * when increasing the value (to 1020), but is not correct when decrementing the
 * value (is 980, but should be 990). This error will be handled by the
 * `onChange` event handler.
 */
const getFouInputStepSize = (value: string | undefined): number => {
    const numberValue = Number(value);
    if (!numberValue || numberValue <= GameServantConstants.MaxFou / 2) {
        return 10;
    }
    return 20;
};

/**
 * Input field for servant's Fou level.
 */
export const ServantFouInputField = React.memo((props: Props) => {

    const {
        value,
        variant,
        label,
        name,
        disabled,
        onChange,
        onBlur
    } = props;

    const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const { name, value } = event.target;
        const transformedValue = FormUtils.transformInputToFouValue(value) ?? '';
        onChange(name, String(transformedValue));
    }, [onChange]);

    const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        handleChange(event);
        onBlur?.(event);
    }, [handleChange, onBlur]);

    return (
        <TextField
            variant={variant}
            fullWidth
            label={label || DefaultLabel}
            name={name}
            type='number'
            inputProps={{
                step: getFouInputStepSize(value),
                min: GameServantConstants.MinFou,
                max: GameServantConstants.MaxFou
            }}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
        />
    );

});
