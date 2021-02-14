import { Button, fade, StyleRules, Theme, Typography, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { ReactNode } from 'react';
import { Link, RouteComponentProps as ReactRouteComponentProps, withRouter } from 'react-router-dom';
import { Container as Injectables } from 'typedi';
import { RouteComponent } from '../components/base/route-component';
import { LoginForm } from '../components/login/login-form.component';
import { PageTitle } from '../components/page-title.component';
import { AuthService } from '../services/authentication/auth.service';
import { UserCredentials, WithStylesProps } from '../types';

type Props = ReactRouteComponentProps & WithStylesProps;

type State = {
    isLoggingIn: boolean;
    errorMessage?: string | null;
};

const FormId = 'login-form';

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20vh',
        [theme.breakpoints.down('xs')]: {
            marginTop: 0
        }
    },
    title: {
        paddingBottom: theme.spacing(8)
    },
    formContainer: {
        width: 360,
        boxSizing: 'border-box',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: fade(theme.palette.text.primary, 0.23),
        borderRadius: 8,
        [theme.breakpoints.down('xs')]: {
            width: '100%',
            border: 'none'
        }
    },
    errorMessage: {
        color: 'red',
        padding: theme.spacing(0, 8, 6, 8)
    },
    form: {
        padding: theme.spacing(0, 8)
    },
    actionButtons: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: theme.spacing(10, 6, 6, 6),
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'Login'
};

const Login = withRouter(withStyles(style, styleOptions)(class extends RouteComponent<Props, State> {

    private _authService = Injectables.get(AuthService);

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoggingIn: false
        };

        this._login = this._login.bind(this);
    }

    render(): ReactNode {
        const { classes } = this.props;
        const { isLoggingIn, errorMessage } = this.state;
        return (
            <div className={classes.root}>
                <div className={classes.formContainer}>
                    <PageTitle>
                        Login
                    </PageTitle>
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
                    <div className={classes.actionButtons}>
                        <Button
                            component={Link}
                            variant="text"
                            color="secondary"
                            to="/register"
                        >
                            Create account
                        </Button>
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            form={FormId}
                            disabled={isLoggingIn}
                        >
                            Login
                    </Button>

                    </div>
                    {/* <div className={classes.actionButtons}>
                        <Button
                            component={Link}
                            color="primary"
                            variant="text"
                            to="/register"
                        >
                            Create account
                        </Button>
                        <Button 
                            color="primary" 
                            variant="contained"
                            type="submit"
                            form={FormId}
                            disabled={isLoggingIn}
                        >
                            Login
                        </Button>
                    </div> */}
                </div>
            </div>
        );
    }

    private async _login(values: UserCredentials): Promise<void> {
        this.setState({
            isLoggingIn: true,
            errorMessage: null
        });
        try {
            await this._authService.login(values);
            this.props.history.push('/user');
        } catch (e) {
            this.setState({
                isLoggingIn: false,
                errorMessage: String(e)
            });
        }
    }

}));

export class LoginRoute extends RouteComponent {

    render(): ReactNode {
        return <Login />;
    }

};
