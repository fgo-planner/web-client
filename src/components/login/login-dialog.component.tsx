import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, withTheme } from '@material-ui/core';
import { ModalComponent, ModalComponentProps, UserCredentials, WithThemeProps } from 'internal';
import React, { ReactNode } from 'react';
import { AuthService } from 'services';
import { Container as Injectables } from 'typedi';
import { LoginDialogForm } from './login-dialog-form.component';

type Props = WithThemeProps;

type State = {
    isLoggingIn: boolean;
    errorMessage?: string | null;
};

export const LoginDialog = withTheme(class extends ModalComponent<Props, State> {

    private _authService = Injectables.get(AuthService);

    constructor(props: Props & ModalComponentProps) {
        super(props);

        this.state = {
            isLoggingIn: false
        };

        this._login = this._login.bind(this);
        this._cancel = this._cancel.bind(this);
    }

    render(): ReactNode {
        const { isLoggingIn, errorMessage } = this.state;
        return (
            <Dialog {...this.props}>
                <Typography component={'div'}>
                    <DialogTitle>
                        Login
                    </DialogTitle>
                    <DialogContent>
                        <div>
                            {errorMessage}
                        </div>
                        <LoginDialogForm formId="login-form" onSubmit={this._login} />
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained"
                                color="secondary" 
                                onClick={this._cancel}>
                            Close
                        </Button>
                        <Button variant="contained"
                                color="primary"
                                form="login-form"
                                type="submit"
                                disabled={isLoggingIn}>
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

    private _cancel() {
        this.props.onClose({}, 'cancel');
    }

});