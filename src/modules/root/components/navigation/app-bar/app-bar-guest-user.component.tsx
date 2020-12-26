import { Button, Theme, withStyles } from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { ModalOnCloseReason, UserCredentials, WithStylesProps, WithThemeProps } from 'internal';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { ThemeConstants } from 'styles';
import { ThemeUtils } from 'utils';
import { LoginModal } from '../../login/login-modal.component';

type Props = WithThemeProps & WithStylesProps;

type State = {
    loginModalOpen: boolean;
};

const style = (theme: Theme) => ({
    root: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(0, 4)
    },
    title: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '24px',
        lineHeight: ThemeUtils.spacingInPixels(theme, ThemeConstants.AppBarHeightScale),
        marginRight: theme.spacing(6)
    }
} as StyleRules);

/**
 * Renders the app bar contents for a guest (not logged in) user.
 */
export const AppBarGuestUser = withStyles(style, { withTheme: true })(class extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            loginModalOpen: false
        };
    }

    render(): ReactNode {
        console.log("AppBarGuestUser RENDERED")
        const styleClasses = this.props.classes;
        return (
            <Fragment>
                <div className={styleClasses.root}>
                    <div className={styleClasses.title}>
                        GuestUser
                    </div>
                    <div>
                        <Button color="primary" onClick={this._openLoginModal.bind(this)}>
                            Login?
                        </Button>
                    </div>
                </div>
                <LoginModal open={this.state.loginModalOpen} onClose={this._handleLoginModalClose.bind(this)} />
            </Fragment>
        );
    }

    private _openLoginModal() {
        this.setState({
            loginModalOpen: true
        });
    }

    private _handleLoginModalClose(event: any, reason: ModalOnCloseReason) {
        console.log(event, reason);
        this.setState({
            loginModalOpen: false
        });
    }

});
