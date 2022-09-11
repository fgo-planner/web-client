import { DateTimeUtils } from '@fgo-planner/common-core';
import { MasterServantUpdateIndeterminate as Indeterminate, MasterServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
import { BaseTextFieldProps, TextField, TextFieldProps } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { ChangeEvent, FocusEvent, KeyboardEvent, useCallback, useRef } from 'react';

type Props = {
    disabled?: boolean;
    label?: string;
    multiEditMode?: boolean;
    /**
     * @deprecated unused
     */
    name: string;
    onBlur?: (event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    onChange: (name: string, value: number | undefined | Indeterminate, pushChanges: boolean) => void;
    /**
     * The servant's summoning date in number of milliseconds since the ECMAScript
     * epoch. This is expected to be truncated such that the UTC hours and lower
     * units are all zero.
     *
     * Can be `undefined`, but is not optional.
     */
    value: number | undefined | Indeterminate;
    variant?: BaseTextFieldProps['variant'];
};

const DefaultLabel = 'Summon Date';

/**
 * Exact match of the date format that is displayed in game.
 */
const DateFormat = 'yyyy-MM-dd';
/**
 * The input mask that corresponds to the `yyyy-MM-dd` date format.
 */
const DateFormatMask = '____-__-__';

const IndeterminateDisplayText = '?';

/**
 * Transforms the given date value into a value that can be used by the date
 * picker component.
 */
const transformDateValueForInput = (value: number | undefined | Indeterminate): Date | null => {
    if (value === undefined || value === IndeterminateValue) {
        return null;
    }
    /*
     * The given value is expected to be relative to UTC time zone, while the date
     * picker uses local time zone. We need to convert the given value to local time
     * zone to avoid wrong day being shown in the input field ude to timezone
     * differences.
     */
    const date = new Date(value);
    return DateTimeUtils.utcToZonedTime(date);
};

const transformDateFromPicker = (date: Date | null): number | undefined => {
    if (!date || isNaN(date.getTime())) {
        return undefined;
    }
    /**
     * The date picker gives date in the local time zone and includes times values
     * (hours, minutes, etc.). We need to truncate the time values and set convert
     * the date to UTC.
     */
    const truncated = DateTimeUtils.truncateToDate(date);
    return DateTimeUtils.zonedToUtcTime(truncated).getTime();
};

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

    /**
     * Cache of the latest date value returned by the onChange event from the date
     * picker.
     */
    const lastDatePickerChangeValueRef = useRef<Date | null>(null);

    const isIndeterminate = value === IndeterminateValue;

    /**
     * This function only handles changes from the calendar picker, or if the user
     * deletes the entire text value from the field. We only cache the change for
     * later use if `keyboardInputValue` is not falsy.
     */
    const handleDatePickerChange = useCallback((date: Date | null, keyboardInputValue?: string): void => {
        lastDatePickerChangeValueRef.current = date;
        if (!!keyboardInputValue) {
            return;
        }
        const transformedValue = transformDateFromPicker(date);
        onChange(name, transformedValue, true);
    }, [name, onChange]);

    /**
     * This function only handles changes from the input field.
     */
    const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        /*
         * If the value is currently indeterminate, push a change with value of
         * undefined to allow the user to continue typing normally.
         */
        if (isIndeterminate) {
            onChange(name, undefined, true);
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

    const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        let transformedValue: number | undefined | Indeterminate;
        if (isIndeterminate) {
            transformedValue = IndeterminateValue;
        } else {
            transformedValue = transformDateFromPicker(lastDatePickerChangeValueRef.current);
        }
        onChange(name, transformedValue, false);
        onBlur?.(event);
    }, [isIndeterminate, name, onBlur, onChange]);

    const renderInput = useCallback((textFieldProps: TextFieldProps): JSX.Element => {
        const { inputProps } = textFieldProps;
        if (inputProps) {
            if (multiEditMode && isIndeterminate) {
                // textFieldProps.inputProps.type = 'text';
                inputProps.value = IndeterminateDisplayText;
            }
        }
        return (
            <TextField
                {...textFieldProps}
                variant={variant}
            />
        );
    }, [isIndeterminate, multiEditMode, variant]);

    const dateValue = transformDateValueForInput(value);

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DesktopDatePicker
                label={label || DefaultLabel}
                inputFormat={DateFormat}
                mask={DateFormatMask}
                value={dateValue}
                // TODO Add showTodayButton when it is added to DesktopDatePicker
                onChange={handleDatePickerChange}
                InputProps={{
                    onBlur: handleBlur,
                    onChange: handleInputChange,
                    onKeyPress: handleIndeterminateInput
                }}
                renderInput={renderInput}
                disabled={disabled}
            />
        </LocalizationProvider>
    );

});
