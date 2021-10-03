import { Checkbox, FormControlLabel, FormGroup, TextField, Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import { Formik, FormikConfig, FormikProps } from 'formik';
import { PureComponent, ReactNode } from 'react';
import * as Yup from 'yup';
import { UserCredentials } from '../../types/data';
import { ComponentStyleProps, WithStylesProps } from '../../types/internal';
import { FormUtils } from '../../utils/form.utils';
import { InputFieldContainer } from '../input/input-field-container.component';

type Props = {
    formId: string;
    onSubmit: FormikConfig<UserCredentials>['onSubmit'];
} & WithStylesProps & ComponentStyleProps;


const ValidationSchema = Yup.object().shape({
    username: Yup.string().required('Username cannot be blank'),
    password: Yup.string().required('Password cannot be blank')
});

const style = (theme: Theme) => ({
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
            password: '',
            noExpire: false
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
                            name="password"
                            type="password"
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
                                    name="noExpire"
                                    checked={values.noExpire}
                                    onChange={handleChange}
                                />
                            }
                            label="Stay signed in"
                        />
                    </FormGroup>
                </div>
            </form>
        );

    }

});
