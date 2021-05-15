import { Button, fade, StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PureComponent, ReactNode } from 'react';
import { Link, RouteComponentProps as ReactRouteComponentProps, withRouter } from 'react-router-dom';
import { LoginForm } from '../components/login/login-form.component';
import { PageTitle } from '../components/text/page-title.component';
import { AuthenticationService } from '../services/authentication/auth.service';
import { UserCredentials, WithStylesProps } from '../types';

type Props = ReactRouteComponentProps & WithStylesProps;

type State = {
    awaitingResponse: boolean;
    errorMessage?: string | null;
};

const FormId = 'login-form';

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        margin: '20vh 0',
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
        backgroundColor: theme.palette.background.paper,
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
    actionsContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        margin: theme.spacing(10, 6, 6, 6),
    },
    actionLinks: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'Login'
};

const Login = withRouter(withStyles(style, styleOptions)(class extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            awaitingResponse: false
        };

        this._login = this._login.bind(this);
    }

    render(): ReactNode {
        const { classes } = this.props;
        const { awaitingResponse, errorMessage } = this.state;
        return (
            <div className={classes.root}>
                <div className={classes.formContainer}>
                    <PageTitle className="pb-8">
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
                    <div className={classes.actionsContainer}>
                        <div className={classes.actionLinks}>
                            <Button
                                component={Link}
                                variant="text"
                                color="secondary"
                                to="/forgot-password"
                            >
                                Forgot password
                            </Button>
                            <Button
                                component={Link}
                                variant="text"
                                color="secondary"
                                to="/register"
                            >
                                Create account
                            </Button>
                        </div>
                        <Button
                            color="primary"
                            variant="contained"
                            type="submit"
                            form={FormId}
                            disabled={awaitingResponse}
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    private async _login(values: UserCredentials): Promise<void> {
        this.setState({
            awaitingResponse: true,
            errorMessage: null
        });
        try {
            await AuthenticationService.login(values);
            this.props.history.push('/user');
        } catch (e) {
            this.setState({
                awaitingResponse: false,
                errorMessage: String(e)
            });
        }
    }

}));

export const LoginRoute = React.memo(() => <Login />);
