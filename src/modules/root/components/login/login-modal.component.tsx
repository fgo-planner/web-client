import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Theme, Typography, withTheme } from '@material-ui/core';
import { ModalComponent, ModalComponentProps } from 'internal';
import React, { ChangeEvent, FormEvent, ReactNode } from 'react';
import { AuthService } from 'services';
import { Container as Injectables } from 'typedi';

type Props = {
    theme: Theme;
};

type LoginForm = {
    username: string;
    password: string;
};

type State = {
    loginForm: LoginForm;
    isLoggingIn: boolean;
    errorMessage?: string | null;
};

export const LoginModal = withTheme(class extends ModalComponent<Props, State> {

    private readonly _authService = Injectables.get(AuthService);

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
    }

    render(): ReactNode {
        return (
            <Dialog {...this.props} >
                <Typography component={'div'}>
                    <DialogTitle>
                        Login
                    </DialogTitle>
                    <DialogContent>
                        <div>
                            {this.state.errorMessage}
                        </div>
                        <form id="login-form" onSubmit={this._login.bind(this)}>
                            <div>
                                <TextField label="Username"
                                           variant="outlined"
                                           id="username"
                                           name="username"
                                           value={this.state.loginForm.username}
                                           onChange={this._handleInputChange.bind(this)}
                                           required />
                            </div>
                            <div>
                                <TextField label="Password"
                                           variant="outlined"
                                           id="password"
                                           name="password"
                                           type="password"
                                           value={this.state.loginForm.password}
                                           onChange={this._handleInputChange.bind(this)}
                                           required />
                            </div>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained"
                                color="secondary" 
                                onClick={this._cancel.bind(this)}>
                            CLOSE
                        </Button>
                        <Button variant="contained"
                                color="primary"
                                form="login-form"
                                type="submit"
                                disabled={this.state.isLoggingIn}>
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
            // The code below may be unnecessary
            this.setState({ 
                loginForm: this._loginFormDefaults,
                isLoggingIn: false
            });
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