import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, withTheme } from '@material-ui/core';
import { ModalComponent, ModalComponentProps, WithThemeProps } from 'internal';
import React, { ChangeEvent, FormEvent, ReactNode } from 'react';
import { AuthService } from 'services';
import { Container as Injectables } from 'typedi';

type Props = WithThemeProps;

type LoginForm = {
    username: string;
    password: string;
};

type State = {
    loginForm: LoginForm;
    isLoggingIn: boolean;
    errorMessage?: string | null;
};

export const LoginDialog = withTheme(class extends ModalComponent<Props, State> {

    private _authService = Injectables.get(AuthService);

    private get _loginFormDefaults(): LoginForm {
        return {
            username: '',
            password: ''
        };
    }

    constructor(props: Props & ModalComponentProps) {
        super(props);

        this.state = {
            loginForm: this._loginFormDefaults,
            isLoggingIn: false
        };

        this._handleInputChange = this._handleInputChange.bind(this);
        this._login = this._login.bind(this);
        this._cancel = this._cancel.bind(this);
    }

    render(): ReactNode {
        const { loginForm, isLoggingIn, errorMessage } = this.state;
        return (
            <Dialog {...this.props} >
                <Typography component={'div'}>
                    <DialogTitle>
                        Login
                    </DialogTitle>
                    <DialogContent>
                        <div>
                            {errorMessage}
                        </div>
                        <form id="login-form" onSubmit={this._login}>
                            <div>
                                <TextField label="Username"
                                           variant="outlined"
                                           id="username"
                                           name="username"
                                           value={loginForm.username}
                                           onChange={this._handleInputChange}
                                           required
                                />
                            </div>
                            <div>
                                <TextField label="Password"
                                           variant="outlined"
                                           id="password"
                                           name="password"
                                           type="password"
                                           value={loginForm.password}
                                           onChange={this._handleInputChange}
                                           required
                                />
                            </div>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained"
                                color="secondary" 
                                onClick={this._cancel}>
                            CLOSE
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

    private _handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target;
        this.setState({
            loginForm: {
                ...this.state.loginForm,
                [name]: value
            }
        });
    }

    private async _login(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        this.setState({ 
            isLoggingIn: true,
            errorMessage: null
        });
        try {
            const { username, password } = this.state.loginForm;
            await this._authService.login({ username, password });

            // Only update the state if the component is still mounted.
            if (this._isMounted) {
                this.setState({
                    loginForm: this._loginFormDefaults,
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
        this.setState({
            loginForm: this._loginFormDefaults
        });
        this.props.onClose({}, 'cancel');
    }

});