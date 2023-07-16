import { Checkbox, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { Formik, FormikConfig, FormikProps } from 'formik';
import React, { ReactNode, useCallback, useRef } from 'react';
import * as Yup from 'yup';
import { UserCredentials } from '../../types';
import { FormUtils } from '../../utils/FormUtils';
import { InputFieldContainer } from '../input/InputFieldContainer';

type Props = {
    formId: string;
    onSubmit: FormikConfig<UserCredentials>['onSubmit'];
};

const ValidationSchema = Yup.object().shape({
    username: Yup.string().required('Username cannot be blank'),
    password: Yup.string().required('Password cannot be blank')
});

export const StyleClassPrefix = 'LoginForm';

export const LoginForm = React.memo((props: Props) => {

    const { formId, onSubmit } = props;

    const formikConfigRef = useRef<FormikConfig<UserCredentials>>({
        initialValues: {
            username: '',
            password: '',
            noExpire: false
        },
        onSubmit: onSubmit,
        validationSchema: ValidationSchema,
        validateOnBlur: true
    });

    const renderForm = useCallback((formikProps: FormikProps<UserCredentials>): ReactNode => {

        const {
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit
        } = formikProps;

        const touchedErrors = FormUtils.getErrorsForTouchedFields(errors, touched);

        return (
            <form
                id={formId}
                className={`${StyleClassPrefix}-root`}
                noValidate
                onSubmit={e => { e.preventDefault(); handleSubmit(e); }}
            >
                <InputFieldContainer width='100%'>
                    <TextField
                        variant='outlined'
                        fullWidth
                        label='Username'
                        name='username'
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!touchedErrors.username}
                        helperText={touchedErrors.username}
                    />
                </InputFieldContainer>
                <InputFieldContainer width='100%'>
                    <TextField
                        variant='outlined'
                        fullWidth
                        label='Password'
                        name='password'
                        type='password'
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!touchedErrors.password}
                        helperText={touchedErrors.password}
                    />
                </InputFieldContainer>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name='noExpire'
                                checked={values.noExpire}
                                onChange={handleChange}
                            />
                        }
                        label='Stay signed in'
                    />
                </FormGroup>
            </form>
        );

    }, [formId]);

    return (
        <Formik {...formikConfigRef.current}>
            {renderForm}
        </Formik>
    );

});
