import { PureComponent, ReactNode } from 'react';
import { CustomStyleProps, UserCredentials, WithStylesProps } from '../../types';
import * as Yup from 'yup';
import { StyleRules, TextField, Theme, withStyles } from '@material-ui/core';
import { Formik, FormikConfig, FormikProps } from 'formik';
import { InputFieldContainer } from '../input-field-container.component';
import { FormUtils } from '../../utils/form.utils';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';

type Props = {
    formId: string;
    onSubmit: FormikConfig<UserCredentials>['onSubmit'];
} & WithStylesProps & CustomStyleProps;


const ValidationSchema = Yup.object().shape({
    username: Yup.string().required('Username cannot be blank'),
    password: Yup.string().required('Password cannot be blank')
});

const style = () => ({
    root: {
        boxSizing: 'border-box'
    },
    inputFieldContainer: {
        width: '100%'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'LoginForm'
};

export const LoginForm = withStyles(style, styleOptions)(class extends PureComponent<Props> {

    private readonly _formikConfig: FormikConfig<UserCredentials> = {
        initialValues: {
            username: '',
            password: ''
        },
        onSubmit: this.props.onSubmit,
        validationSchema: ValidationSchema,
        validateOnBlur: true
    };

    constructor(props: Props) {
        super(props);

        this._renderForm = this._renderForm.bind(this);
    }

    render() {
        return (
            <Formik {...this._formikConfig}>
                {this._renderForm}
            </Formik>
        );
    }

    private _renderForm(props: FormikProps<UserCredentials>): ReactNode {

        const {
            classes,
            formId
        } = this.props;

        const {
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit
        } = props;

        const touchedErrors = FormUtils.getErrorsForTouchedFields(errors, touched);

        return (
            <form 
                className={classes.form}
                id={formId}
                noValidate
                onSubmit={e => { e.preventDefault(); handleSubmit(e); }}
            >
                <div className={classes.root}>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Username"
                            id="username"
                            name="username"
                            value={values.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!touchedErrors.username}
                            helperText={touchedErrors.username}
                        />
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <TextField
                            variant="outlined"
                            fullWidth
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
                    </InputFieldContainer>
                </div>
            </form>
        );

    }

});
