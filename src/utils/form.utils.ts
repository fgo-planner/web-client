import { InstantiatedServantUpdateBoolean, InstantiatedServantUtils } from '@fgo-planner/data-core';
import { FormikErrors, FormikTouched } from 'formik';
import lodash from 'lodash-es';

export class FormUtils {

    private constructor () {
        
    }

    static getErrorsForTouchedFields<T>(errors: FormikErrors<T>, touched: FormikTouched<T>): FormikErrors<T> {
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
    static convertToNumber<T = number>(input: string, min?: number, max?: number): T | undefined {
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
    static convertToInteger<T = number>(input: string, min?: number, max?: number): T | undefined {
        const value = this.convertToNumber(input, min, max);
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
    static transformInputToFouValue(input: string): number | undefined {
        if (!input) {
            return undefined;
        }
        const value = Number(input);
        return InstantiatedServantUtils.roundToNearestValidFouValue(value);
    }

    static assignValue<T>(object: NonNullable<T>, path: string, value: string | number | undefined): T {
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
    static computeNextToggleValue(current: InstantiatedServantUpdateBoolean, allowIndeterminate = false): InstantiatedServantUpdateBoolean {
        switch (current) {
            case InstantiatedServantUpdateBoolean.True:
                return allowIndeterminate ? InstantiatedServantUpdateBoolean.Indeterminate : InstantiatedServantUpdateBoolean.False;
            case InstantiatedServantUpdateBoolean.False:
                return InstantiatedServantUpdateBoolean.True;
            default:
                return allowIndeterminate ? InstantiatedServantUpdateBoolean.False : InstantiatedServantUpdateBoolean.True;
        }
    }

}