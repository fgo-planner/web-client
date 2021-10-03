import { Button, Checkbox, fade, FormControlLabel, FormGroup, StyleRules, TextField, Theme, Tooltip, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { Formik, FormikConfig, FormikHelpers, FormikProps } from 'formik';
import React, { ChangeEvent, Fragment, PureComponent, ReactNode } from 'react';
import { Link, RouteComponentProps as ReactRouteComponentProps, withRouter } from 'react-router-dom';
import * as Yup from 'yup';
import { InputFieldContainer } from '../components/input/input-field-container.component';
import { PageTitle } from '../components/text/page-title.component';
import { UserService } from '../services/data/user/user.service';
import { WithStylesProps } from '../types/internal';
import { FormUtils } from '../utils/form.utils';

type FormData = {
    username: string,
    password: string,
    confirmPassword: string,
    email: string,
    friendId: string
};

type Props = ReactRouteComponentProps & WithStylesProps;

type State = {
    termsAccepted: boolean;
    awaitingResponse: boolean;
    errorMessage?: string | null;
    success?: boolean;
    redirectTimeout?: NodeJS.Timeout;
};

const FormId = 'registration-form';

const SuccessRedirectDelay = 5000;

const SuccessMessage1 = 'Account registration was successful.';

const SuccessMessage2 = 'You will be automatically redirected to the login page in 5 seconds. You may also click on link below to log in.';

const ValidationSchema = Yup.object().shape({
    username: Yup
        .string()
        .min(4, 'Username must be at least 4 characters long')
        .required('Username cannot be blank'),
    password: Yup
        .string()
        .min(2, 'Password must be at least 2 characters long')
        .required('Password cannot be blank'),
    confirmPassword: Yup
        .string()
        .test('passwords-match', 'Passwords do not match', function (value) {
            return this.parent.password === value;
        }),
    email: Yup
        .string()
        .email('Invalid email address'),
    friendId: Yup
        .number()
        .min(0)
        .max(999999999)
});

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        margin: '10vh 0',
        [theme.breakpoints.down('xs')]: {
            marginTop: 0
        }
    },
    title: {
        paddingBottom: theme.spacing(8)
    },
    formContainer: {
        width: 420,
        boxSizing: 'border-box',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: fade(theme.palette.text.primary, 0.23),
        borderRadius: 8,
        backgroundColor: theme.palette.background.paper,
        [theme.breakpoints.down('xs')]: {
            width: '100%',
            border: 'none'
        }
    },
    errorMessage: {
        color: 'red',
        padding: theme.spacing(0, 8, 6, 8)
    },
    form: {
        padding: theme.spacing(0, 8),
        boxSizing: 'border-box'
    },
    inputFieldContainer: {
        width: '100%'
    },
    actionsContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        margin: theme.spacing(10, 6, 6, 6)
    },
    actionLinks: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        '& >div': {
            color: theme.palette.text.secondary,
            padding: theme.spacing(1, 2)
        }
    },
    success: {
        height: 654,
        boxSizing: 'border-box',
        // display: 'flex',
        // flexDirection: 'column',
        // alignItems: 'flex-end',
        padding: theme.spacing(0, 4)
    },
    successMessage: {
        padding: theme.spacing(4, 2, 16, 2)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'Registration'
};

const Registration = withRouter(withStyles(style, styleOptions)(class extends PureComponent<Props, State> {

    private readonly _formikConfig: FormikConfig<FormData> = {
        initialValues: {
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            friendId: ''
        },
        onSubmit: this._register.bind(this),
        validationSchema: ValidationSchema,
        validateOnBlur: true
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            termsAccepted: false,
            awaitingResponse: false
        };

        this._renderForm = this._renderForm.bind(this);
        this._handleTermsCheckboxChange = this._handleTermsCheckboxChange.bind(this);
    }

    componentWillUnmount() {
        const { redirectTimeout } = this.state;
        if (redirectTimeout !== undefined) {
            clearTimeout(redirectTimeout);
        }
    }

    render(): ReactNode {
        const { classes } = this.props;
        const { success } = this.state;
        return (
            <div className={classes.root}>
                <div className={classes.formContainer}>
                    <PageTitle className="pb-8">
                        {success ? 'Success!' : 'Create Account'}
                    </PageTitle>
                    {success ? 
                        this._renderSuccessStage() :
                        this._renderRegistrationStage()
                    }
                </div>
            </div>
        );
    }

    private _renderSuccessStage(): ReactNode {
        const { classes } = this.props;
        return (
            <div className={classes.success}>
                <div className={classes.successMessage}>
                    <div>{SuccessMessage1}</div>
                    <br />
                    <div>{SuccessMessage2}</div>
                </div>
                <Button
                    component={Link}
                    variant="text"
                    color="secondary"
                    to="/login"
                >
                    Click here to login
                </Button>
            </div>
        );
    }

    private _renderRegistrationStage(): ReactNode {
        const { classes } = this.props;
        const { termsAccepted, awaitingResponse, errorMessage } = this.state;
        return (
            <Fragment>
                {errorMessage &&
                    <div className={classes.errorMessage}>
                        {errorMessage}
                    </div>
                }
                <Formik {...this._formikConfig}>
                    {this._renderForm}
                </Formik>
                <div className={classes.actionsContainer}>
                    <div className={classes.actionLinks}>
                        <div>
                            Already have an account?
                            </div>
                        <Button
                            component={Link}
                            variant="text"
                            color="secondary"
                            to="/login"
                        >
                            Login instead
                        </Button>
                    </div>
                    <Tooltip title={termsAccepted ? '' : 'Terms must be accepted'} placement="top">
                        <div>
                            <Button
                                color="primary"
                                variant="contained"
                                type="submit"
                                form={FormId}
                                disabled={!termsAccepted || awaitingResponse}
                            >
                                Register
                            </Button>
                        </div>
                    </Tooltip>
                </div>
            </Fragment>
        );
    }

    private _renderForm(props: FormikProps<FormData>): ReactNode {
        const { classes } = this.props;
        const { termsAccepted } = this.state;

        const {
            values,
            errors,
            touched,
            setFieldValue,
            handleBlur,
            handleChange,
            handleSubmit
        } = props;

        const touchedErrors = FormUtils.getErrorsForTouchedFields(errors, touched);

        return (
            <form
                id={FormId}
                noValidate
                onSubmit={e => { e.preventDefault(); handleSubmit(e); }}
            >
                <div className={classes.form}>
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
                            required
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
                            required
                        />
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!touchedErrors.confirmPassword}
                            helperText={touchedErrors.confirmPassword}
                        />
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Email (for account recovery)"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={!!touchedErrors.email}
                            helperText={touchedErrors.email}
                        />
                    </InputFieldContainer>
                    <InputFieldContainer className={classes.inputFieldContainer}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Friend ID"
                            name="friendId"
                            value={values.friendId}
                            onChange={e => this._handleFriendIdChange(e, setFieldValue)}
                            onBlur={handleBlur}
                            error={!!touchedErrors.friendId}
                            helperText={touchedErrors.friendId}
                        />
                    </InputFieldContainer>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="noExpire"
                                    checked={termsAccepted}
                                    onChange={this._handleTermsCheckboxChange}
                                />
                            }
                            label="I accept terms and conditions"
                        />
                    </FormGroup>
                </div>
            </form>
        );

    }

    private _handleFriendIdChange(
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setFieldValue: FormikHelpers<FormData>['setFieldValue']
    ): void {

        const { name, value } = event.target;

        let transformedValue = '';
        for (let i = 0; i < value.length; i++) {
            const c = value.charAt(i);
            if (c >= '0' && c <= '9') {
                transformedValue += c;
            }
            if (transformedValue.length === 9) {
                break;
            }
        }

        setFieldValue(name, transformedValue, false);
    }

    private _handleTermsCheckboxChange(e: ChangeEvent<HTMLInputElement>): void {
        const { checked } = e.target;
        this.setState({
            termsAccepted: checked
        });
    }

    private async _register(formData: FormData): Promise<void> {
        this.setState({
            awaitingResponse: true,
            errorMessage: null
        });
        try {
            const { confirmPassword, ...user } = formData;
            await UserService.register(user as any);

            // Wait 5 seconds before redirecting to login page
            const redirectTimeout = setTimeout(() => {
                this.props.history.push('/login');
            }, SuccessRedirectDelay);

            this.setState({
                success: true,
                redirectTimeout
            });
        } catch (e: any) {
            this.setState({
                awaitingResponse: false,
                errorMessage: e.message || String(e)
            });
        }
    }

}));

export const RegistrationRoute = React.memo(() => <Registration />);
