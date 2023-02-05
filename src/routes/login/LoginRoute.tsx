import { alpha, Button } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginForm, StyleClassPrefix as LoginFormStyleClassPrefix } from '../../components/login/LoginForm';
import { PageTitle } from '../../components/text/PageTitle';
import { useInjectable } from '../../hooks/dependency-injection/useInjectable';
import { AuthenticationService } from '../../services/authentication/AuthenticationService';
import { UserCredentials } from '../../types';

const FormId = 'login-form';

const StyleClassPrefix = 'LoginRoute';

const StyleProps = {
    display: 'flex',
    justifyContent: 'center',
    mt: {
        xs: 0,
        sm: '20vh'
    },
    [`& .${StyleClassPrefix}-title`]: {
        pb: 8
    },
    [`& .${StyleClassPrefix}-form-container`]: {
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
    },
    [`& .${LoginFormStyleClassPrefix}-root`]: {
        px: 8,
        py: 0
    },
    [`& .${StyleClassPrefix}-error-message`]: {
        color: 'red',
        px: 8,
        pb: 6
    },
    [`& .${StyleClassPrefix}-actions-container`]: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        mx: 6,
        mt: 10,
        mb: 6
    },
    [`& .${StyleClassPrefix}-action-links`]: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start'
    }
} as SystemStyleObject<Theme>;

export const LoginRoute = React.memo(() => {

    const authenticationService = useInjectable(AuthenticationService);

    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    const navigate = useNavigate();

    const login = useCallback(async (values: UserCredentials): Promise<void> => {
        setIsLoggingIn(true);
        setErrorMessage(undefined);
        try {
            await authenticationService.login(values);
            // Temporarily navigate to home instead of dashboard.
            // TODO Navigate to dashboard once the page is implemented.
            navigate('/');
        } catch (e: any) {
            setIsLoggingIn(false);
            setErrorMessage(e.message || String(e));
        }
    }, [authenticationService, navigate]);

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-form-container`}>
                <PageTitle className='pb-8'>
                    Login
                </PageTitle>
                {errorMessage &&
                    <div className={`${StyleClassPrefix}-error-message`}>
                        {errorMessage}
                    </div>
                }
                <LoginForm
                    formId={FormId}
                    onSubmit={login}
                />
                <div className={`${StyleClassPrefix}-actions-container`}>
                    <div className={`${StyleClassPrefix}-actions-links`}>
                        <Button
                            component={Link}
                            variant='text'
                            color='secondary'
                            to='/forgot-password'
                        >
                            Forgot password
                        </Button>
                        <Button
                            component={Link}
                            variant='text'
                            color='secondary'
                            to='/register'
                        >
                            Create account
                        </Button>
                    </div>
                    <Button
                        color='primary'
                        variant='contained'
                        type='submit'
                        form={FormId}
                        disabled={isLoggingIn}
                    >
                        Login
                    </Button>
                </div>
            </div>
        </Box>
    );

});
