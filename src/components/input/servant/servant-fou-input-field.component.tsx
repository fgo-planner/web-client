import { BaseTextFieldProps, TextField } from '@mui/material';
import React, { ChangeEvent, FocusEvent, KeyboardEvent, useCallback } from 'react';
import { GameServantConstants } from '../../../constants';
import { FormUtils } from '../../../utils/form.utils';

type Props = {
    disabled?: boolean;
    label?: string;
    multiEditMode?: boolean;
    name: string;
    onBlur?: (event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    onChange: (name: string, value: string) => void;
    value: string;
    variant?: BaseTextFieldProps['variant'];
};

const DefaultLabel = 'Fou';

const IndeterminateDisplayText = '?';
const IndeterminateValue = '-1';

/**
 * Calculates the step size for the Fou number input fields based on the current
 * value of the field.
 *
 * Note that at 1000 Fou, the step size is calculated to be 20. This is correct
 * when increasing the value (to 1020), but is not correct when decrementing the
 * value (is 980, but should be 990).
 */
const getFouInputStepSize = (value: string | undefined): number => {
    const numberValue = Number(value);
    if (!numberValue || numberValue <= GameServantConstants.MaxFou / 2) {
        return 10;
    }
    return 20;
};

/**
 * Input field for a servant's Fou level. This is applicable to both master and
 * planned servants.
 */
export const ServantFouInputField = React.memo((props: Props) => {

    const {
        disabled,
        label,
        multiEditMode,
        name,
        onChange,
        onBlur,
        value,
        variant
    } = props;

    const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const { name, value } = event.target;
        /*
         * Rounding/capping is not done until onBlur is trigger to allow the user to
         * type without interference.
         */
        onChange(name, value);
    }, [onChange]);

    const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const { name, value: inputValue } = event.target;
        let transformedValue: string;
        if (multiEditMode && inputValue === IndeterminateDisplayText) {
            transformedValue = IndeterminateValue;
        } else {
            transformedValue = String(FormUtils.transformInputToFouValue(inputValue) ?? '');
        }
        onChange(name, transformedValue);
        onBlur?.(event);
    }, [multiEditMode, onBlur, onChange]);

    /**
     * Allows the user to set the field back to indeterminate state when
     * multiple servants are being edited by typing in a `?` symbol. Normally
     * this is not allowed because the input only accepts numbers.
     */
    const handleIndeterminateInput = useCallback((event: KeyboardEvent<HTMLInputElement>): void => {
        /*
         * Ignore the event if only a single servant is being edited, or if the key
         * pressed was not the `?` key.
         */
        if (!multiEditMode || event.key !== '?') {
            return;
        }
        onChange(name, IndeterminateValue);
        /*
         * Prevent the onChange event from firing again.
         */
        event.preventDefault();
    }, [multiEditMode, name, onChange]);

    if (multiEditMode && value === IndeterminateValue) {
        return (
            <TextField
                variant={variant}
                fullWidth
                label={label || DefaultLabel}
                name={name}
                inputProps={{
                    onKeyPress: handleIndeterminateInput
                }}
                value={IndeterminateDisplayText}
                onChange={handleChange}
                onBlur={handleBlur}
            />
        );
    }

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
                max: GameServantConstants.MaxFou,
                onKeyPress: handleIndeterminateInput
            }}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
        />
    );

});
