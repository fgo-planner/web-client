import { Button, Dialog, DialogActions, DialogContent, DialogTitle, StyleRules, Theme, Typography, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Container as Injectables } from 'typedi';
import { AuthService } from '../../services/authentication/auth.service';
import { ModalComponentProps, UserCredentials, WithStylesProps } from '../../types';
import { ModalComponent } from '../base/modal-component';
import { LoginForm } from './login-form.component';

type Props = ModalComponentProps & WithStylesProps;

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
    inputFieldContainer: {
        width: '294px !important'
    },
    dialogActions: {
        justifyContent: 'space-between',
        padding: theme.spacing(6)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'LoginDialog'
};

export const LoginDialog = withStyles(style, styleOptions)(class extends ModalComponent<Props, State> {

    private _authService = Injectables.get(AuthService);

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
        const { classes, ...dialogProps } = this.props;
        const { isLoggingIn, errorMessage } = this.state;

        const loginFormClasses = {
            root: classes.form, 
            inputFieldContainer: classes.inputFieldContainer
        };

        return (
            <Dialog {...dialogProps}>
                <Typography component={'div'}>
                    <DialogTitle>
                        Login
                    </DialogTitle>
                    <DialogContent>
                        {errorMessage && 
                            <div className={classes.errorMessage}>
                                {errorMessage}
                            </div>
                        }
                        <LoginForm
                            classes={loginFormClasses} 
                            formId={FormId}
                            onSubmit={this._login}
                        />
                    </DialogContent>
                    <DialogActions className={classes.dialogActions}>
                        <Button
                            component={Link}
                            variant="text"
                            color="secondary"
                            to="/register"
                            onClick={this._cancel}
                        >
                            Create account
                        </Button>
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

    private _cancel(): void {
        this.props.onClose({}, 'cancel');
    }

});