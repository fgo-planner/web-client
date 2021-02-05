import { Button, Dialog, DialogActions, DialogContent, DialogTitle, StyleRules, TextField, Theme, Typography, withStyles } from '@material-ui/core';
import { InputFieldContainer } from 'components';
import { Formik, FormikConfig, FormikProps } from 'formik';
import { ModalComponent, ModalComponentProps, UserCredentials, WithStylesProps } from 'internal';
import React, { ReactNode } from 'react';
import { AuthService } from 'services';
import { Container as Injectables } from 'typedi';
import { FormUtils } from 'utils';
import * as Yup from 'yup';

type Props = ModalComponentProps & WithStylesProps;

type State = {
    isLoggingIn: boolean;
    errorMessage?: string | null;
};

const style = (theme: Theme) => ({
    form: {
        padding: theme.spacing(4, 2, 0, 2)
    },
    inputFieldContainer: {
        width: '256px'
    }
} as StyleRules);

export const LoginDialog = withStyles(style)(class extends ModalComponent<Props, State> {

    private readonly _formId = 'login-form';

    private readonly _validationSchema = Yup.object().shape({
        username: Yup.string().required('Username cannot be blank'),
        password: Yup.string().required('Password cannot be blank')
    });

    private readonly _formikConfig: FormikConfig<UserCredentials> = {
        initialValues: {
            username: '',
            password: ''
        },
        onSubmit: this._login.bind(this),
        validationSchema: this._validationSchema,
        validateOnBlur: true
    };

    private _authService = Injectables.get(AuthService);

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoggingIn: false
        };

        this._renderForm= this._renderForm.bind(this);
        this._login = this._login.bind(this);
        this._cancel = this._cancel.bind(this);
    }

    render(): ReactNode {
        const { isLoggingIn, errorMessage } = this.state;
        return (
            <Dialog {...this.props} classes={undefined}>
                <Typography component={'div'}>
                    <DialogTitle>
                        Login
                    </DialogTitle>
                    <DialogContent>
                        <div>
                            {errorMessage}
                        </div>
                        <Formik {...this._formikConfig}>
                            {this._renderForm}
                        </Formik>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained"
                                color="secondary" 
                                onClick={this._cancel}>
                            Close
                        </Button>
                        <Button variant="contained"
                                color="primary"
                                form={this._formId}
                                type="submit"
                                disabled={isLoggingIn}>
                            Login
                        </Button>
                    </DialogActions>
                </Typography>
            </Dialog>
        );
    }

    private _renderForm(props: FormikProps<UserCredentials>): ReactNode {
        const { classes } = this.props;
        const { values, errors, touched, handleBlur, handleChange, handleSubmit } = props;
        const touchedErrors = FormUtils.getErrorsForTouchedFields(errors, touched);
        return (
            <form className={classes.form} 
                  id={this._formId} 
                  noValidate
                  onSubmit={e => { e.preventDefault(); handleSubmit(e); }}
            >
                <InputFieldContainer className={classes.inputFieldContainer}>
                    <TextField variant="outlined"
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
                    <TextField variant="outlined"
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
            </form>
        );
    }

    private async _login(values: UserCredentials): Promise<void> {
        this.setState({ 
            isLoggingIn: true,
            errorMessage: null
        });
        try {
            await this._authService.login(values);

            // Only update the state if the component is still mounted.
            if (this._isMounted) {
                this.setState({
                    isLoggingIn: false
                });
            }
            
            this.props.onClose({}, 'submit');
        } catch (e) {
            this.setState({
                isLoggingIn: false,
                errorMessage: String(e)
            });
        }
    }

    private _cancel() {
        this.props.onClose({}, 'cancel');
    }

});