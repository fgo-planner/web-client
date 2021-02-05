import { FormikErrors, FormikTouched } from 'formik';
import lodash from 'lodash';
import { MasterServantUtils } from './master/master-servant.utils';

export class FormUtils {

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
     * number, then `undefined` is returned. If the input contains decimal values,
     * then the number is truncated before returning. Optionally clamps the number
     * between a min and max value.
     */
    static transformInputToInteger(input: string, min?: number, max?: number): number | undefined {
        if (!input) {
            return undefined;
        }
        let value = Number(input);
        if (min && min !== 0 && value < min) {
            value = min;
        }
        if (max && max !== 0 && value > max) {
            value = max;
        }
        return ~~value;
    }

    /**
     * Transforms the string input into an valid Fou upgrade value. If the input
     * was not a valid number, then `undefined` is returned. If the input contains
     * decimal values, then the number is truncated before returning.
     * 
     * Valid Fou values are integers in multiples of 10 for values between 0 and
     * 1000, and integers in multiples of 20 for values between 1000 and 2000.
     */
    static transformInputToFouValue(input: string): number | undefined {
        if (!input) {
            return undefined;
        }
        const value = Number(input);
        return MasterServantUtils.roundToNearestValidFouValue(value);
    }

    static assignValue<T>(object: NonNullable<T>, path: string, value: string | number | undefined): T {
        return lodash.set(object as any, path, value);
    }

    static convertInputValueToNumber(value: string | number | undefined): number | undefined {
        if (value === undefined || value === '') {
            return undefined;
        }
        return Number(value);
    }

}