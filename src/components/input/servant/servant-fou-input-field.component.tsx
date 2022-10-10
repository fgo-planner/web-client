import { MasterServantConstants, MasterServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
import { BaseTextFieldProps, TextField } from '@mui/material';
import React, { ChangeEvent, FocusEvent, KeyboardEvent, useCallback } from 'react';
import { FormUtils } from '../../../utils/form.utils';

type FouStat = 'fouHp' | 'fouAtk';

type Props = {
    disabled?: boolean;
    label?: string;
    multiEditMode?: boolean;
    name: string;
    onBlur?: (event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    onChange: (name: string, stat: FouStat, value: string) => void;
    stat: FouStat;
    value: string;
    variant?: BaseTextFieldProps['variant'];
};

const DefaultLabel = 'Fou';

const IndeterminateDisplayText = '?';

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
    if (!numberValue || numberValue <= MasterServantConstants.MaxFou / 2) {
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
        onBlur,
        onChange,
        stat,
        value,
        variant
    } = props;

    const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const { name, value } = event.target;
        /*
         * Rounding/capping is not done until onBlur is trigger to allow the user to
         * type without interference.
         */
        onChange(name, stat, value);
    }, [onChange, stat]);

    const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        const { name, value: inputValue } = event.target;
        let transformedValue: string;
        if (multiEditMode && inputValue === IndeterminateDisplayText) {
            transformedValue = String(IndeterminateValue);
        } else {
            transformedValue = String(FormUtils.transformInputToFouValue(inputValue) ?? '');
        }
        onChange(name, stat, transformedValue);
        onBlur?.(event);
    }, [multiEditMode, onBlur, onChange, stat]);

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
        onChange(name, stat, String(IndeterminateValue));
        /*
         * Prevent the onChange event from firing again.
         */
        event.preventDefault();
    }, [multiEditMode, name, onChange, stat]);

    if (multiEditMode && value === String(IndeterminateValue)) {
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
                min: MasterServantConstants.MinFou,
                max: MasterServantConstants.MaxFou,
                onKeyPress: handleIndeterminateInput
            }}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
        />
    );

});
