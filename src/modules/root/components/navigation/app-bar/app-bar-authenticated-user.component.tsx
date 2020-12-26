import { Theme, withStyles, Button } from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { UserInfo, WithStylesProps, WithThemeProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { ThemeConstants } from 'styles';
import { ThemeUtils } from 'utils';
import { Container as Injectables } from 'typedi';
import { AuthService } from 'services';

type Props = {
    currentUser?: UserInfo;
} & WithThemeProps & WithStylesProps;

type State = {

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
 * Renders the app bar contents for an authenticated (logged in) user.
 */
export const AppBarAuthenticatedUser = withStyles(style, { withTheme: true })(class extends PureComponent<Props, State> {

    private readonly _authService = Injectables.get(AuthService);

    render(): ReactNode {
        console.log("AppBarAuthenticatedUser RENDERED")
        const styleClasses = this.props.classes;
        return (
            <div className={styleClasses.root}>
                <div className={styleClasses.title}>
                    AuthenticatedUser
                </div>
                <div>
                    <Button color="primary" onClick={this._logout.bind(this)}>
                        Logout!
                    </Button>
                </div>
            </div>
        );
    }

    private _logout() {
        this._authService.logout();
    }

});
