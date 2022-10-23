import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useInjectable } from '../../hooks/dependency-injection/use-injectable.hook';
import { useAutoResizeDialog } from '../../hooks/user-interface/use-auto-resize-dialog.hook';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { UserCredentials } from '../../types/data';
import { DialogComponentProps } from '../../types/internal';
import { DialogCloseButton } from '../dialog/dialog-close-button.component';
import { LoginForm, StyleClassPrefix as LoginFormStyleClassPrefix } from './login-form.component';

type Props = DialogComponentProps;

const LoginPath = 'login';

const LoginDialogDisabledPaths: ReadonlyArray<string> = [
    LoginPath,
    'register',
    'forgot-password'
];

const LoginDialogDisabledPathsRegex = new RegExp(LoginDialogDisabledPaths.join('|'));

/**
 * Whether to redirect the user to the login page instead of opening the login
 * dialog, based on current location. This special behavior currently applies to
 * the following routes:
 * - /login
 * - /register
 * - /forgot-password
 */
const shouldRedirectToLoginRoute = (pathname: string): boolean => {
    return LoginDialogDisabledPathsRegex.test(pathname);
};

const FormId = 'login-dialog-form';

const StyleClassPrefix = 'LoginDialog';

const StyleProps = {
    [`& .${LoginFormStyleClassPrefix}-root`]: {
        p: 2
    },
    [`& .${StyleClassPrefix}-error-message`]: {
        color: 'red',
        px: 2,
        pt: 0,
        pb: 4
    },
    [`& .${StyleClassPrefix}-dialog-actions`]: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        p: 6
    },
    [`& .${StyleClassPrefix}-action-links`]: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start'
    }
} as SystemStyleObject<Theme>;

export const LoginDialog = React.memo((props: Props) => {

    const location = useLocation();
    const navigate = useNavigate();

    const authenticationService = useInjectable(AuthenticationService);

    const {
        onClose,
        open,
        showCloseIcon,
        ...dialogProps
    } = props;

    const [openOverride, setOpenOverride] = useState<boolean>(open);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        setOpenOverride(prevState => {
            /**
             * If the `open` state was changed to `true`, then check if the user needs to be
             * redirected to the login path based on the current location. Only proceed with
             * opening the dialog if redirect is not needed.
             */
            if (open && !prevState) {
                const pathname = location.pathname;
                if (shouldRedirectToLoginRoute(pathname)) {
                    /**
                     * Only navigate to the login path if the user is not already there. Otherwise,
                     * redundant states will be pushed to the history.
                     */
                    if (!pathname.includes(LoginPath)) {
                        navigate(`/${LoginPath}`);
                    }
                    /**
                     * Invoke the `onClose` callback even though the dialog was not opened to notify
                     * the `UserInterfaceService`
                     */
                    onClose({}, 'cancel');
                    return false;
                }
            }
            return open;
        });
    }, [location.pathname, navigate, onClose, open]);

    const {
        fullScreen,
        closeIconEnabled,
    } = useAutoResizeDialog(props);

    const login = useCallback(async (values: UserCredentials): Promise<void> => {
        setIsLoggingIn(true);
        setErrorMessage(undefined);
        try {
            await authenticationService.login(values);
            /**
             * Only update the state if the component is still mounted.
             */
            if (isMounted) {
                setIsLoggingIn(false);
            }
            onClose({}, 'submit');
        } catch (e: any) {
            setIsLoggingIn(false);
            setErrorMessage(e.message || String(e));
        }
    }, [authenticationService, isMounted, onClose]);

    const cancel = useCallback((): void => {
        onClose({}, 'cancel');
    }, [onClose]);

    return (
        <Dialog
            {...dialogProps}
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            open={openOverride}
            fullScreen={fullScreen}
            onClose={onClose}
        >
            <Typography component={'div'}>
                <DialogTitle>
                    Login
                    {closeIconEnabled && <DialogCloseButton onClick={cancel} />}
                </DialogTitle>
                <DialogContent>
                    {errorMessage &&
                        <div className={`${StyleClassPrefix}-error-message`}>
                            {errorMessage}
                        </div>
                    }
                    <LoginForm
                        formId={FormId}
                        onSubmit={login}
                    />
                </DialogContent>
                <DialogActions className={`${StyleClassPrefix}-dialog-actions`}>
                    <div className={`${StyleClassPrefix}-action-links`}>
                        <Button
                            component={Link}
                            variant='text'
                            color='secondary'
                            to='/forgot-password'
                            onClick={cancel}
                        >
                            Forgot password
                        </Button>
                        <Button
                            component={Link}
                            variant='text'
                            color='secondary'
                            to='/register'
                            onClick={cancel}
                        >
                            Create account
                        </Button>
                    </div>
                    <Button
                        variant='contained'
                        color='primary'
                        form={FormId}
                        type='submit'
                        disabled={isLoggingIn}
                    >
                        Login
                    </Button>
                </DialogActions>
            </Typography>
        </Dialog>
    );

});
