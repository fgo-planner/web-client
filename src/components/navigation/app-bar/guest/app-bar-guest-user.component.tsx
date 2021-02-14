import { StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { RouteComponentProps as ReactRouteComponentProps, withRouter } from 'react-router-dom';
import { ModalOnCloseReason, WithStylesProps } from '../../../../types';
import { LoginDialog } from '../../../login/login-dialog.component';
import { AppBarLink } from '../app-bar-link.component';
import { AppBarLinks } from '../app-bar-links.component';

type Props = WithStylesProps & ReactRouteComponentProps;

type State = {
    loginModalOpen: boolean;
};

const style = (theme: Theme) => ({
    root: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 4)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'AppBarGuestUser'
};

/**
 * Renders the app bar contents for a guest (not logged in) user.
 */
export const AppBarGuestUser = withRouter(withStyles(style, styleOptions)(class extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            loginModalOpen: false
        };

        this._openLoginDialog = this._openLoginDialog.bind(this);
        this._handleLoginDialogClose = this._handleLoginDialogClose.bind(this);
    }
 
    render(): ReactNode {
        const {classes} = this.props;
        const { loginModalOpen } = this.state;
        return (
            <Fragment>
                <div className={classes.root}>
                    <AppBarLinks>
                        <AppBarLink
                            label="Servants"
                            route="/resources/servants"
                            active={this._isLinkActive('/resources/servants') && !loginModalOpen}
                        />
                        <AppBarLink
                            label="Items"
                            route="/resources/items"
                            active={this._isLinkActive('/resources/items') && !loginModalOpen}
                        />
                        <AppBarLink
                            label="Events"
                            route="/resources/events"
                            active={this._isLinkActive('/resources/events') && !loginModalOpen}
                        />
                        <AppBarLink
                            label="Login"
                            onClick={this._openLoginDialog}
                            active={this._isLinkActive('/login') || loginModalOpen}
                        />
                    </AppBarLinks>
                </div>
                <LoginDialog
                    open={loginModalOpen}
                    onClose={this._handleLoginDialogClose}
                />
            </Fragment>
        );
    }

    private _openLoginDialog(): void {
        const { location, history } = this.props;
        const pathname = location?.pathname;

        const redirect = pathname && (
            pathname.startsWith('/login') ||
            pathname.startsWith('/register') ||
            pathname.startsWith('/forgot-password')
        );

        if (redirect) {
            history.push('/login');
        } else {
            this.setState({ loginModalOpen: true });
        }
    }

    private _handleLoginDialogClose(event: any, reason: ModalOnCloseReason): void {
        this.setState({
            loginModalOpen: false
        });
    }

    private _isLinkActive(route: string, exact?: boolean): boolean {
        const { location } = this.props;
        if (!route) {
            return false;
        }
        if (exact) {
            return location?.pathname === route;
        } else {
            return location?.pathname.startsWith(route);
        }
    }

}));
