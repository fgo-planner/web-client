import { Paper, Theme, withStyles } from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { Nullable, UserInfo, WithStylesProps, WithThemeProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { AuthService, UserService } from 'services';
import { ThemeConstants } from 'styles';
import { Container as Injectables } from 'typedi';
import { ThemeUtils } from 'utils';
import { AppBarAuthenticatedUser } from './app-bar-authenticated-user.component';
import { AppBarGuestUser } from './app-bar-guest-user.component';
import { User } from 'data';

type Props = {
    appBarElevated: boolean;
} & WithThemeProps & WithStylesProps;

type State = {
    currentUser: User | null;
};

const style = (theme: Theme) => ({
    root: {
        height: ThemeUtils.spacingInPixels(theme, ThemeConstants.AppBarHeightScale),
        transition: 'box-shadow 200ms 50ms linear',
        '&.no-elevation' : {
            boxShadow: '0px 1px 0px rgba(0,0,0,0.12)' // Simulates 1px solid border
        }
    },
    contents: {
        display: 'flex',
        flexDirection: 'row',
        paddingLeft: theme.spacing(4)
    },
    title: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '24px',
        lineHeight: ThemeUtils.spacingInPixels(theme, ThemeConstants.AppBarHeightScale),
        marginRight: theme.spacing(6)
    }
} as StyleRules);

/**
 * The app bar component.
 */
export const AppBar = withStyles(style, { withTheme: true })(class extends PureComponent<Props, State> {

    private readonly _authService = Injectables.get(AuthService);

    private readonly _userService = Injectables.get(UserService);

    private _onCurrentUserChangeSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            currentUser: null
        };
    }

    componentDidMount() {
        this._onCurrentUserChangeSubscription = this._authService.onCurrentUserChange
            .subscribe(this._handleCurrentUserChange.bind(this));
    }

    render(): ReactNode {
        console.log("AppBar RENDERED");
        const styleClasses = this.props.classes;
        return (
            <Paper className={`${styleClasses.root} ${this.props.appBarElevated ? '' : 'no-elevation'}`}
                   elevation={ThemeConstants.AppBarElevatedElevation}
                   square={true}>
                <div className={styleClasses.contents}>
                    <div className={styleClasses.title}>
                        FGO Servant Planner
                    </div>
                    {this.state.currentUser ? <AppBarAuthenticatedUser /> : <AppBarGuestUser />}
                </div>
            </Paper>
        );
    }

    componentWillUnmount() {
        this._onCurrentUserChangeSubscription.unsubscribe();
    }

    private async _handleCurrentUserChange(userInfo: Nullable<UserInfo>): Promise<void> {
        console.log(userInfo);
        if (userInfo) {
            // TODO Handle error
            const currentUser = await this._userService.getCurrentUser();
            console.log(currentUser);
            this.setState({ currentUser });
        } else {
            this.setState({ currentUser: null });
        }
    }
    
});
