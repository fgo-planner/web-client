import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Theme, Typography } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAutoResizeDialog } from '../../hooks/user-interface/use-auto-resize-dialog.hook';
import { AuthenticationService } from '../../services/authentication/auth.service';
import { UserCredentials } from '../../types/data';
import { DialogComponentProps } from '../../types/internal';
import { DialogCloseButton } from '../dialog/dialog-close-button.component';
import { LoginForm } from './login-form.component';

type Props = DialogComponentProps;

const FormId = 'login-dialog-form';

const style = (theme: Theme) => ({
    errorMessage: {
        color: 'red',
        padding: theme.spacing(0, 2, 4, 2)
    },
    form: {
        padding: theme.spacing(2)
    },
    dialogActions: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: theme.spacing(6)
    },
    actionLinks: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'LoginDialog'
};

const useStyles = makeStyles(style, styleOptions);

export const LoginDialog = React.memo((props: Props) => {

    const {
        showCloseIcon,
        onClose,
        ...dialogProps
    } = props;

    const classes = useStyles();

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
                        <div className={classes.errorMessage}>
                            {errorMessage}
                        </div>
                    }
                    <LoginForm
                        classes={{ root: classes.form }}
                        formId={FormId}
                        onSubmit={login}
                    />
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                    <div className={classes.actionLinks}>
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
