import { alpha, Button, Checkbox, FormControlLabel, FormGroup, TextField, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import { Formik, FormikConfig, FormikHelpers, FormikProps } from 'formik';
import React, { ChangeEvent, Fragment, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { InputFieldContainer } from '../components/input/input-field-container.component';
import { PageTitle } from '../components/text/page-title.component';
import { useInjectable } from '../hooks/dependency-injection/use-injectable.hook';
import { UserService } from '../services/data/user/user.service';
import { FormUtils } from '../utils/form.utils';

type FormData = {
    username: string,
    password: string,
    confirmPassword: string,
    email: string,
    friendId: string
};

const styles = {
    root: {
        display: 'flex',
        justifyContent: 'center',
        mt: {
            xs: 0,
            sm: '10vh'
        }
    } as SystemStyleObject<Theme>,
    title: {
        pb: 8
    } as SystemStyleObject<Theme>,
    formContainer: {
        width: {
            xs: '100%',
            sm: 420
        },
        boxSizing: 'border-box',
        borderWidth: {
            xs: 0,
            sm: 1
        },
        borderStyle: 'solid',
        borderColor: (theme: Theme) => alpha(theme.palette.text.primary, 0.23),
        borderRadius: {
            xs: 0,
            sm: 2
        },
        backgroundColor: (theme: Theme) => theme.palette.background.paper
    } as SystemStyleObject<Theme>,
    errorMessage: {
        color: 'red',
        px: 8,
        pb: 6
    } as SystemStyleObject<Theme>,
    form: {
        px: 8,
        boxSizing: 'border-box'
    } as SystemStyleObject<Theme>,
    actionsContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        mx: 6,
        mt: 10,
        mb: 6
    } as SystemStyleObject<Theme>,
    actionLinks: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        '& >div': {
            color: (theme: Theme) => theme.palette.text.secondary,
            px: 2,
            py: 1
        }
    } as SystemStyleObject<Theme>,
    success: {
        height: 654,
        boxSizing: 'border-box',
        px: 4
    } as SystemStyleObject<Theme>,
    successMessage: {
        px: 2,
        pt: 4,
        pb: 16
    } as SystemStyleObject<Theme>
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

export const RegistrationRoute = React.memo(() => {

    const navigate = useNavigate();

    const userService = useInjectable(UserService);

    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout>();

    useEffect(() => {
        return () => {
            if (redirectTimeout !== undefined) {
                clearTimeout(redirectTimeout);
            }
        };
    }, [redirectTimeout]);

    const register = useCallback(async (formData: FormData): Promise<void> => {
        setIsRegistering(true);
        setErrorMessage(undefined);
        try {
            const { confirmPassword, ...user } = formData;
            await userService.register(user as any);

            // Wait 5 seconds before redirecting to login page
            const redirectTimeout = setTimeout(() => {
                navigate('/login');
            }, SuccessRedirectDelay);

            setSuccess(true);
            setRedirectTimeout(redirectTimeout);
        } catch (e: any) {
            setIsRegistering(false);
            setErrorMessage(e.message || String(e));
        }
    }, [navigate, userService]);

    const handleFriendIdChange = useCallback((
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setFieldValue: FormikHelpers<FormData>['setFieldValue']
    ): void => {

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
    }, []);

    const handleTermsCheckboxChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
        setTermsAccepted(e.target.checked);
    }, []);

    const formikConfigRef = useRef<FormikConfig<FormData>>({
        initialValues: {
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            friendId: ''
        },
        onSubmit: register,
        validationSchema: ValidationSchema,
        validateOnBlur: true
    });

    const renderForm = useCallback((formikProps: FormikProps<FormData>): ReactNode => {

        const {
            values,
            errors,
            touched,
            setFieldValue,
            handleBlur,
            handleChange,
            handleSubmit
        } = formikProps;

        const touchedErrors = FormUtils.getErrorsForTouchedFields(errors, touched);

        return (
            <form
                id={FormId}
                noValidate
                onSubmit={e => { e.preventDefault(); handleSubmit(e); }}
            >
                <Box sx={styles.form}>
                    <InputFieldContainer width="100%">
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
                    <InputFieldContainer width="100%">
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
                    <InputFieldContainer width="100%">
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
                    <InputFieldContainer width="100%">
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
                    <InputFieldContainer width="100%">
                        <TextField
                            variant="outlined"
                            fullWidth
                            label="Friend ID"
                            name="friendId"
                            value={values.friendId}
                            onChange={e => handleFriendIdChange(e, setFieldValue)}
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
                                    onChange={handleTermsCheckboxChange}
                                />
                            }
                            label="I accept terms and conditions"
                        />
                    </FormGroup>
                </Box>
            </form>
        );

    }, [handleFriendIdChange, handleTermsCheckboxChange, termsAccepted]);

    const stageContentsNode: ReactNode = useMemo(() => {
        /*
         * Registration stage
         */
        if (!success) {
            return (
                <Fragment>
                    {errorMessage &&
                        <Box sx={styles.errorMessage}>
                            {errorMessage}
                        </Box>
                    }
                    <Formik {...formikConfigRef.current}>
                        {renderForm}
                    </Formik>
                    <Box sx={styles.actionsContainer}>
                        <Box sx={styles.actionLinks}>
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
                        </Box>
                        <Tooltip title={termsAccepted ? '' : 'Terms must be accepted'} placement="top">
                            <div>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    type="submit"
                                    form={FormId}
                                    disabled={!termsAccepted || isRegistering}
                                >
                                    Register
                                </Button>
                            </div>
                        </Tooltip>
                    </Box>
                </Fragment>
            );
        }

        /*
         * Success stage
         */
        return (
            <Box sx={styles.success}>
                <Box sx={styles.successMessage}>
                    <div>{SuccessMessage1}</div>
                    <br />
                    <div>{SuccessMessage2}</div>
                </Box>
                <Button
                    component={Link}
                    variant="text"
                    color="secondary"
                    to="/login"
                >
                    Click here to login
                </Button>
            </Box>
        );
    }, [errorMessage, isRegistering, renderForm, success, termsAccepted]);

    return (
        <Box sx={styles.root}>
            <Box sx={styles.formContainer}>
                <PageTitle className="pb-8">
                    {success ? 'Success!' : 'Create Account'}
                </PageTitle>
                {stageContentsNode}
            </Box>
        </Box>
    );

});
