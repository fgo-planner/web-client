import { FormikHelpers } from 'formik';

export type FormProps<T> = {
    formId?: string;
    onSubmit?: (values: T, formikHelpers?: FormikHelpers<T>)  => void | Promise<any>;
};
