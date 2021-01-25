import { TextField } from '@material-ui/core';
import { Formik, FormikConfig, FormikProps } from 'formik';
import { UserCredentials } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { FormUtils } from 'utils';
import * as Yup from 'yup';

type Props = {
    formId?: string;
    onSubmit?: (values: UserCredentials) => void;
};

export class LoginDialogForm extends PureComponent<Props> {

    private static readonly ValidationSchema = Yup.object().shape({
        username: Yup.string().required(),
        password: Yup.string().required()
    });

    private readonly _formikConfig: FormikConfig<UserCredentials> = {
        initialValues: {
            username: '',
            password: ''
        },
        onSubmit: this._onSubmit.bind(this),
        validationSchema: LoginDialogForm.ValidationSchema,
        validateOnBlur: false
    };

    constructor(props: Props) {
        super(props);

        this._renderForm = this._renderForm.bind(this);
    }

    render(): ReactNode {
        return (
            <Formik {...this._formikConfig}>
                {this._renderForm}
            </Formik>
        );
    }

    private _renderForm(props: FormikProps<UserCredentials>): ReactNode {
        const { formId } = this.props;
        const { values, errors, touched, handleBlur, handleChange, handleSubmit } = props;
        const touchedErrors = FormUtils.getErrorsForTouchedFields(errors, touched);
        return (
            <form noValidate id={formId} onSubmit={e => { e.preventDefault(); handleSubmit(e); }}>
                <div>
                    <TextField variant="outlined"
                               label="Username"
                               id="username"
                               name="username"
                               value={values.username}
                               onChange={handleChange}
                               onBlur={handleBlur}
                               error={!!touchedErrors.username}
                               helperText={touchedErrors.username}
                    />
                </div>
                <div>
                    <TextField variant="outlined"
                               label="Password"
                               id="password"
                               name="password"
                               type="password"
                               value={values.password}
                               onChange={handleChange}
                               onBlur={handleBlur}
                               error={!!touchedErrors.password}
                               helperText={touchedErrors.password}
                    />
                </div>
            </form>
        );
    };

    private _onSubmit(values: UserCredentials): void {
        const { onSubmit } = this.props;
        onSubmit && onSubmit(values);
    }

};
