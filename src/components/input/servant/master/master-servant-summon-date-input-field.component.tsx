import { DesktopDatePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { BaseTextFieldProps, TextField, TextFieldProps } from '@mui/material';
import React, { FocusEvent, KeyboardEvent, useCallback } from 'react';
import { DateTimeUtils } from '../../../../utils/date-time.utils';

type Props = {
    disabled?: boolean;
    label?: string;
    multiEditMode?: boolean;
    /**
     * @deprecated unused
     */
    name: string;
    onBlur?: (event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    onChange: (name: string, value: number | undefined, pushChanges: boolean) => void;
    value: number | undefined; // Can be undefined, but is not optional.
    variant?: BaseTextFieldProps['variant'];
};


const DefaultLabel = 'Summon Date';

const IndeterminateDisplayText = '?';
const IndeterminateValue = -1;

/**
 * Input field for a servant's summon date. This is currently only applicable to
 * master servants.
 */
export const MasterServantSummonDateInputField = React.memo((props: Props) => {

    const {
        disabled,
        label,
        multiEditMode,
        name,
        onBlur,
        onChange,
        value,
        variant
    } = props;

    const isIndeterminate = value === IndeterminateValue;

    const handleChange = useCallback((date: Date | null, keyboardInputValue?: string) => {
        // console.log(date, date?.getTime(), keyboardInputValue, isIndeterminate);
        const pushChanges = keyboardInputValue === undefined;
        if (!date) {
            onChange(name, undefined, pushChanges);
        } else {
            const milliseconds = DateTimeUtils.truncateToDays(date).getTime();
            if (!isNaN(milliseconds)) {
                onChange(name, milliseconds, pushChanges);
            } else if (isIndeterminate) {
                onChange(name, undefined, pushChanges);
            }
        }
    }, [isIndeterminate, name, onChange]);

    const handleIndeterminateInput = useCallback((event: KeyboardEvent<HTMLInputElement>): void => {
        /*
         * Ignore the event if only a single servant is being edited, or if the key
         * pressed was not the `?` key.
        */
        if (!multiEditMode || event.key !== '?') {
            return;
        }
        onChange(name, IndeterminateValue, true);
        /*
         * Prevent the onChange event from firing again.
         */
        event.preventDefault();
    }, [multiEditMode, name, onChange]);

    const renderInput = useCallback((textFieldProps: TextFieldProps): JSX.Element => {
        if (textFieldProps.inputProps) {
            if (multiEditMode && isIndeterminate) {
                // textFieldProps.inputProps.type = 'text';
                textFieldProps.inputProps.value = IndeterminateDisplayText;
            }
            textFieldProps.variant = variant;
        }
        return (
            <TextField {...textFieldProps} />
        );
    }, [isIndeterminate, multiEditMode, variant]);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DesktopDatePicker
                label={label || DefaultLabel}
                inputFormat='MM/dd/yyyy'
                value={value ?? null}
                // TODO Add showTodayButton when it is added to DesktopDatePicker
                onChange={handleChange}
                InputProps={{
                    onKeyPress: handleIndeterminateInput,
                    onBlur
                }}
                renderInput={renderInput}
                disabled={disabled}
            />
        </LocalizationProvider>
    );

});
