import { alpha, Button } from '@mui/material';
import { Box, SxProps, Theme } from '@mui/system';
import React, { CSSProperties, useCallback, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { LoginForm } from '../components/login/login-form.component';
import { PageTitle } from '../components/text/page-title.component';
import { AuthenticationService } from '../services/authentication/auth.service';
import { UserCredentials } from '../types/data';

const styles = {
    root: {
        display: 'flex',
        justifyContent: 'center',
        mt: {
            xs: 0,
            sm: '20vh'
        }
    } as SxProps<Theme>,
    title: {
        pb: 8
    } as SxProps<Theme>,
    formContainer: {
        width: {
            xs: '100%',
            sm: 360
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
        backgroundColor: (theme: Theme) => theme.palette.background.paper,
    } as SxProps<Theme>,
    form: {
        px: 8,
        py: 0
    } as SxProps<Theme>,
    errorMessage: {
        color: 'red',
        px: 8,
        pb: 6
    } as SxProps<Theme>,
    actionsContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        mx: 6,
        mt: 10,
        mb: 6
    } as SxProps<Theme>,
    actionLinks: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start'
    } as CSSProperties
};

const FormId = 'login-form';

export const LoginRoute = React.memo(() => {

    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    const history = useHistory();

    const login = useCallback(async (values: UserCredentials): Promise<void> => {
        setIsLoggingIn(true);
        setErrorMessage(undefined);
        try {
            await AuthenticationService.login(values);
            history.push('/user');
        } catch (e: any) {
            setIsLoggingIn(false);
            setErrorMessage(e.message || String(e));
        }
    }, [history]);

    return (
        <Box sx={styles.root}>
            <Box sx={styles.formContainer}>
                <PageTitle className="pb-8">
                    Login
                </PageTitle>
                {errorMessage &&
                    <Box sx={styles.errorMessage}>
                        {errorMessage}
                    </Box>
                }
                <LoginForm
                    sx={styles.form}
                    formId={FormId}
                    onSubmit={login}
                />
                <Box sx={styles.actionsContainer}>
                    <Box sx={styles.actionLinks}>
                        <Button
                            component={Link}
                            variant="text"
                            color="secondary"
                            to="/forgot-password"
                        >
                            Forgot password
                        </Button>
                        <Button
                            component={Link}
                            variant="text"
                            color="secondary"
                            to="/register"
                        >
                            Create account
                        </Button>
                    </Box>
                    <Button
                        color="primary"
                        variant="contained"
                        type="submit"
                        form={FormId}
                        disabled={isLoggingIn}
                    >
                        Login
                    </Button>
                </Box>
            </Box>
        </Box>
    );

});
