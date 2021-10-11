import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { Box, SxProps, Theme } from '@mui/system';
import React, { CSSProperties, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAutoResizeDialog } from '../../hooks/user-interface/use-auto-resize-dialog.hook';
import { AuthenticationService } from '../../services/authentication/auth.service';
import { UserCredentials } from '../../types/data';
import { DialogComponentProps } from '../../types/internal';
import { DialogCloseButton } from '../dialog/dialog-close-button.component';
import { LoginForm } from './login-form.component';

type Props = DialogComponentProps;

const styles = {
    form: {
        p: 2
    } as SxProps<Theme>,
    errorMessage: {
        color: 'red',
        px: 2,
        pt: 0,
        pb: 4
    } as SxProps<Theme>,
    dialogActions: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        p: 6
    } as SxProps<Theme>,
    actionLinks: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start'
    } as CSSProperties
};

const FormId = 'login-dialog-form';

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
        <Dialog {...dialogProps} fullScreen={fullScreen}>
            <Typography component={'div'}>
                <DialogTitle>
                    Login
                    {closeIconEnabled && <DialogCloseButton onClick={cancel} />}
                </DialogTitle>
                <DialogContent>
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
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <div style={styles.actionLinks}>
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
