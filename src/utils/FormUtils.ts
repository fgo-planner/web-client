import { InstantiatedServantUpdateBoolean as UpdateBoolean, InstantiatedServantUtils } from '@fgo-planner/data-core';
import { FormikErrors, FormikTouched } from 'formik';
import lodash from 'lodash-es';

export namespace FormUtils {

    export function getErrorsForTouchedFields<T>(errors: FormikErrors<T>, touched: FormikTouched<T>): FormikErrors<T> {
        const result: FormikErrors<T> = {};
        for (const _key in errors) {
            const key = _key as keyof FormikErrors<T>;
            if (touched[key]) {
                result[key] = errors[key];
            }
        }
        return result;
    }

    /**
     * Transforms the string input into an integer. If the input was not a valid
     * number, then `undefined` is returned. Optionally clamps the number between a
     * min and max value.
     */
    export function convertToNumber<T = number>(input: string, min?: number, max?: number): T | undefined {
        if (!input) {
            return undefined;
        }
        let value = Number(input);
        if (isNaN(value)) {
            return undefined;
        }
        if (min && min !== 0 && value < min) {
            value = min;
        }
        if (max && max !== 0 && value > max) {
            value = max;
        }
        return value as any;
    }

    /**
     * Transforms the string input into an integer. If the input was not a valid
     * number, then `undefined` is returned. If the input contains decimal values,
     * then the number is truncated before returning. Optionally clamps the number
     * between a min and max value.
     */
    export function convertToInteger<T = number>(input: string, min?: number, max?: number): T | undefined {
        const value = convertToNumber(input, min, max);
        if (value === undefined) {
            return undefined;
        }
        return ~~value as T;
    }

    /**
     * Transforms the string input into an valid Fou enhancement value. If the
     * input was not a valid number, then `undefined` is returned. If the input
     * contains decimal values, then the number is truncated before returning.
     * 
     * Valid Fou values are integers in multiples of 10 for values between 0 and
     * 1000, and integers in multiples of 20 for values between 1000 and 2000.
     */
    export function transformInputToFouValue(input: string): number | undefined {
        if (!input) {
            return undefined;
        }
        const value = Number(input);
        return InstantiatedServantUtils.roundToNearestValidFouValue(value);
    }

    export function assignValue<T>(object: NonNullable<T>, path: string, value: string | number | undefined): T {
        return lodash.set(object as any, path, value);
    }

    /**
     * Find the next value in the cycle for a toggleable form input (ie. checkbox).
     * The possible values depends on whether indeterminate values are allowed:
     *
     * Indeterminate allowed: `false` -> `true` -> `IndeterminateValue`
     *
     * Indeterminate not allowed: `false` -> `true`
     */
    export function computeNextToggleValue(current: UpdateBoolean, allowIndeterminate = false): UpdateBoolean {
        switch (current) {
            case UpdateBoolean.True:
                return allowIndeterminate ? UpdateBoolean.Indeterminate : UpdateBoolean.False;
            case UpdateBoolean.False:
                return UpdateBoolean.True;
            default:
                return allowIndeterminate ? UpdateBoolean.False : UpdateBoolean.True;
        }
    }

}

