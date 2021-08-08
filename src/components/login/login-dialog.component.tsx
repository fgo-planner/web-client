import { Button, Dialog, DialogActions, DialogContent, DialogTitle, StyleRules, Theme, Typography, withStyles, withWidth } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AuthenticationService } from '../../services/authentication/auth.service';
import { UserCredentials } from '../../types/data';
import { DialogComponentProps, WithStylesProps } from '../../types/internal';
import { DialogComponent } from '../base/dialog-component';
import { DialogCloseButton } from '../dialog/dialog-close-button.component';
import { LoginForm } from './login-form.component';

type Props = DialogComponentProps & WithStylesProps;

type State = {
    isLoggingIn: boolean;
    errorMessage?: string | null;
};

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

export const LoginDialog = withWidth()(withStyles(style, styleOptions)(class extends DialogComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoggingIn: false
        };

        this._login = this._login.bind(this);
        this._cancel = this._cancel.bind(this);
    }

    componentDidUpdate(prevProps: Props) {
        const { open } = this.props;
        if (open && !prevProps.open) {
            this.setState({ errorMessage: null });
        }
    }

    render(): ReactNode {
        const { classes, showCloseIcon, ...dialogProps } = this.props;
        const { isLoggingIn, errorMessage } = this.state;
        const { fullScreen, closeIconEnabled } = this._computeFullScreenProps();
        return (
            <Dialog {...dialogProps} fullScreen={fullScreen}>
                <Typography component={'div'}>
                    <DialogTitle>
                        Login
                        {closeIconEnabled && <DialogCloseButton onClick={this._cancel}/>}
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
                            onSubmit={this._login}
                        />
                    </DialogContent>
                    <DialogActions className={classes.dialogActions}>
                        <div className={classes.actionLinks}>
                            <Button
                                component={Link}
                                variant="text"
                                color="secondary"
                                to="/forgot-password"
                                onClick={this._cancel}
                            >
                                Forgot password
                            </Button>
                            <Button
                                component={Link}
                                variant="text"
                                color="secondary"
                                to="/register"
                                onClick={this._cancel}
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
    }

    private async _login(values: UserCredentials): Promise<void> {
        this.setState({ 
            isLoggingIn: true,
            errorMessage: null
        });
        try {
            await AuthenticationService.login(values);

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

    private _cancel(): void {
        this.props.onClose({}, 'cancel');
    }

}));
