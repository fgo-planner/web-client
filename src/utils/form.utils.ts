import { FormikErrors, FormikTouched } from 'formik';

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

}