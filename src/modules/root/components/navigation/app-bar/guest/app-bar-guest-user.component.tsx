import { StyleRules, Theme, withStyles } from '@material-ui/core';
import { ModalOnCloseReason, RouteLinkDefinitions, WithStylesProps, WithThemeProps } from 'internal';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { LoginModal } from '../../../login/login-modal.component';
import { AppBarLinks } from '../app-bar-links.component';

type Props = WithThemeProps & WithStylesProps;

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

/**
 * Renders the app bar contents for a guest (not logged in) user.
 */
export const AppBarGuestUser = withStyles(style, { withTheme: true })(class extends PureComponent<Props, State> {

    private readonly Links: RouteLinkDefinitions = [
        {
            label: 'Servants',
            route: '/resources/servants'
        },
        {
            label: 'Items'
        },
        {
            label: 'Events',
            route: '/resources/events'
        },
        {
            label: 'Login',
            onClick: this._openLoginModal.bind(this)
        }
    ];

    constructor(props: Props) {
        super(props);
        this.state = {
            loginModalOpen: false
        };
        this._handleLoginModalClose = this._handleLoginModalClose.bind(this);
    }

 
    render(): ReactNode {
        const styleClasses = this.props.classes;
        return (
            <Fragment>
                <div className={styleClasses.root}>
                    <AppBarLinks links={this.Links} />
                </div>
                <LoginModal open={this.state.loginModalOpen}
                            onClose={this._handleLoginModalClose}
                />
            </Fragment>
        );
    }

    private _openLoginModal(): void {
        this.setState({
            loginModalOpen: true
        });
    }

    private _handleLoginModalClose(event: any, reason: ModalOnCloseReason) {
        this.setState({
            loginModalOpen: false
        });
    }

});
