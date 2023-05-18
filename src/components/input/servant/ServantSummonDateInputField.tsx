import { DateTimeUtils } from '@fgo-planner/common-core';
import { InstantiatedServantUpdateIndeterminate as Indeterminate, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue } from '@fgo-planner/data-core';
import { TextField, TextFieldProps } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import clsx from 'clsx';
import React, { FocusEvent, KeyboardEvent, useCallback, useRef } from 'react';

type Props = {
    disabled?: boolean;
    label?: string;
    multiEditMode?: boolean;
    /**
     * The servant's summoning date in number of milliseconds since the ECMAScript
     * epoch. This is expected to be truncated such that the UTC hours and lower
     * units are all zero.
     */
    value: number | Indeterminate | null;
    onBlur?(event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void;
    onChange(value: number | Indeterminate | null): void;
};

const DefaultLabel = 'Summon Date';

/**
 * Exact match of the date format that is displayed in game.
 */
const DateFormat = 'yyyy-MM-dd';

const IndeterminateDisplayText = '?';

const IndeterminateTextField: React.FC<TextFieldProps> = (props: TextFieldProps) => (
    <TextField
        {...props}
        value={IndeterminateDisplayText}
    />
);

/**
 * Transforms the given date value into a value that can be used by the date
 * picker component.
 */
const transformDateValueForInput = (value: number | Indeterminate | null): Date | null => {
    if (value == null || value === IndeterminateValue) {
        return null;
    }
    /**
     * The given value is expected to be relative to UTC time zone, while the date
     * picker uses local time zone. We need to convert the given value to local time
     * zone to avoid wrong date being shown in the input field due to timezone
     * differences.
     */
    /** */
    const date = new Date(value);
    return DateTimeUtils.utcToZonedTime(date);
};

const transformDateFromPicker = (date: Date | null): number | null => {
    if (!date || isNaN(date.getTime())) {
        return null;
    }
    /**
     * The date picker gives date in the local time zone and includes times values
     * (hours, minutes, etc.). We need to truncate the time values and convert the
     * date to UTC.
     */
    /** */
    const truncated = DateTimeUtils.truncateToDate(date);
    return DateTimeUtils.zonedToUtcTime(truncated).getTime();
};

const StyleClassPrefix = 'ServantSummonDateInputField';

/**
 * Input field for a servant's summon date. This is currently only applicable to
 * master servants.
 */
export const ServantSummonDateInputField = React.memo((props: Props) => {

    const {
        disabled,
        label,
        multiEditMode,
        onBlur,
        onChange,
        value
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    /**
     * Cache of the latest date value returned by the onChange event from the date
     * picker.
     */
    const lastDatePickerChangeValueRef = useRef<Date | null>(null);

    const isIndeterminate = value === IndeterminateValue;

    const focusInput = useCallback((): void => {
        inputRef.current && inputRef.current.focus();
    }, []);

    /**
     * This function only handles changes from the calendar picker.
     */
    const handleDatePickerChange = useCallback((date: Date | null): void => {
        lastDatePickerChangeValueRef.current = date;
        const transformedValue = transformDateFromPicker(date);
        onChange(transformedValue);
    }, [onChange]);

    const handleIndeterminateInput = useCallback((event: KeyboardEvent<HTMLInputElement>): void => {
        if (multiEditMode && event.key === '?') {
            onChange(IndeterminateValue);
            setTimeout(focusInput);
            /**
             * Prevent the onChange event from firing again.
             */
            event.preventDefault();
        } else if (isIndeterminate) {
            onChange(null);
            setTimeout(focusInput);
        }
    }, [focusInput, isIndeterminate, multiEditMode, onChange]);

    const handleBlur = useCallback((event: FocusEvent<HTMLTextAreaElement | HTMLInputElement>): void => {
        let transformedValue: number | Indeterminate | null;
        if (isIndeterminate) {
            transformedValue = IndeterminateValue;
        } else {
            transformedValue = transformDateFromPicker(lastDatePickerChangeValueRef.current);
        }
        if (transformedValue == null) {
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            });
        }

        onChange(transformedValue);
        onBlur?.(event);
    }, [isIndeterminate, onBlur, onChange]);

    const dateValue = transformDateValueForInput(value);

    // TODO Find a way to input indeterminate value in mobile mode.

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                className={clsx(`${StyleClassPrefix}-root`, 'full-width')}
                label={label || DefaultLabel}
                format={DateFormat}
                value={dateValue}
                inputRef={inputRef}
                onChange={handleDatePickerChange}
                slotProps={{
                    textField: {
                        onBlur: handleBlur,
                        onKeyPress: handleIndeterminateInput
                    }
                }}
                slots={{
                    textField: isIndeterminate ? IndeterminateTextField : TextField
                }}
                disabled={disabled}
            />
        </LocalizationProvider>
    );

});
