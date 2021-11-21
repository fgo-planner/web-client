import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAutoResizeDialog } from '../../hooks/user-interface/use-auto-resize-dialog.hook';
import { AuthenticationService } from '../../services/authentication/auth.service';
import { UserCredentials } from '../../types/data';
import { DialogComponentProps } from '../../types/internal';
import { DialogCloseButton } from '../dialog/dialog-close-button.component';
import { LoginForm, StyleClassPrefix as LoginFormStyleClassPrefix } from './login-form.component';

type Props = DialogComponentProps;

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

    const {
        showCloseIcon,
        onClose,
        ...dialogProps
    } = props;

    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        return () => setIsMounted(false);
    }, []);

    const {
        fullScreen,
        closeIconEnabled,
    } = useAutoResizeDialog(props);

    const login = useCallback(async (values: UserCredentials): Promise<void> => {
        setIsLoggingIn(true);
        setErrorMessage(undefined);
        try {
            await AuthenticationService.login(values);
            /*
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
    }, [isMounted, onClose]);

    const cancel = useCallback((event: any): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    return (
        <Dialog
            {...dialogProps}
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            fullScreen={fullScreen}
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
                            variant="text"
                            color="secondary"
                            to="/forgot-password"
                            onClick={cancel}
                        >
                            Forgot password
                        </Button>
                        <Button
                            component={Link}
                            variant="text"
                            color="secondary"
                            to="/register"
                            onClick={cancel}
                        >
                            Create account
                        </Button>
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        form={FormId}
                        type="submit"
                        disabled={isLoggingIn}
                    >
                        Login
                    </Button>
                </DialogActions>
            </Typography>
        </Dialog>
    );

});
