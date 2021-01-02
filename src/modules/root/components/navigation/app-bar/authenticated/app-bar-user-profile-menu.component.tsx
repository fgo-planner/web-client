import { Avatar, Divider, ListItemIcon, ListItemText, MenuItem, StyleRules, Theme, withStyles } from '@material-ui/core';
import { AccountCircle, ExitToApp, Settings, SportsEsports, WbSunny, NightsStay, Info, InfoOutlined } from '@material-ui/icons';
import { User } from 'data';
import { ModalOnCloseHandler, WithStylesProps, WithThemeProps, ThemeMode } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { AuthService, ThemeService } from 'services';
import { ThemeConstants } from 'styles';
import { Container as Injectables } from 'typedi';
import { ThemeUtils } from 'utils';
import { AppBarActionMenu } from '../action-menu/app-bar-action-menu.component';
import { AppBarActionMenuItem } from '../action-menu/app-bar-action-menu-item.component';
import { Subscription } from 'rxjs';

type Props = {
    anchorElement?: Element | null;
    onClose?: ModalOnCloseHandler;
    currentUser: User;
} & WithThemeProps & WithStylesProps;

type State = {
    themeMode: ThemeMode;
};

const style = (theme: Theme) => ({
    root: {
        width: '280px' // TODO Un-hardcode this
    },
    menuHeader: {
        display: 'flex',
        padding: theme.spacing(2, 4)
    },
    avatar: {
        width: ThemeUtils.spacingInPixels(theme, 14),
        height: ThemeUtils.spacingInPixels(theme, 14),
        marginRight: ThemeUtils.spacingInPixels(theme, 3)
    },
    userInfo: {
        maxWidth: '180px' // TODO Un-hardcode this
    },
    username: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '16px',
        fontWeight: 500,
        color: theme.palette.text.primary
    },
    email: {
        fontFamily: theme.typography.fontFamily,
        fontSize: '14px',
        color: theme.palette.text.secondary
    }
} as StyleRules);

export const AppBarUserProfileMenu = withStyles(style, { withTheme: true })(class extends PureComponent<Props, State> {

    private _authService = Injectables.get(AuthService);

    private _themeService = Injectables.get(ThemeService);

    private _onThemeChangeSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            themeMode: this._themeService.themeMode
        };
        this._logout = this._logout.bind(this);
        this._toggleThemeMode = this._toggleThemeMode.bind(this);
    }

    componentDidMount() {
        this._onThemeChangeSubscription = this._themeService.onThemeChange
            .subscribe(this._handleThemeChange.bind(this));
    }

    componentWillUnmount() {
        this._onThemeChangeSubscription.unsubscribe();
    }

    render(): ReactNode {
        const isLightMode = this.state.themeMode === 'light';
        return (
            <AppBarActionMenu className={this.props.classes.root}
                              anchorElement={this.props.anchorElement}
                              onClose={this.props.onClose}>

                {this._renderMenuHeader()}

                <AppBarActionMenuItem label="Profile" 
                                      icon={AccountCircle} 
                                      to="/user/profile"
                />
                <AppBarActionMenuItem label="Settings" 
                                      icon={Settings} 
                                      to="/user/settings"
                />
                <AppBarActionMenuItem label="Game Accounts" 
                                      icon={SportsEsports} 
                                      to="/user/game-accounts"
                />
                <AppBarActionMenuItem label="Log Out" 
                                      icon={ExitToApp} 
                                      onClick={this._logout}
                />

                <Divider />

                <AppBarActionMenuItem label={`Appearance: ${isLightMode ? 'Light' : 'Dark'}`}
                                      icon={isLightMode ? WbSunny : NightsStay} 
                                      onClick={this._toggleThemeMode}
                />
                <AppBarActionMenuItem label="About" 
                                      icon={InfoOutlined} 
                />

            </AppBarActionMenu>
        );
    }

    private _renderMenuHeader(): ReactNode {
        const styleClasses = this.props.classes;
        return (
            <div className={styleClasses.menuHeader}>
                <Avatar className={styleClasses.avatar} src="https://assets.atlasacademy.io/GameData/JP/MasterFace/equip00052.png" />
                <div className={styleClasses.userInfo}>
                    <div className={`${styleClasses.username} truncate`}>
                        {this.props.currentUser.username}
                    </div>
                    <div className={`${styleClasses.email} truncate`}>
                        {this.props.currentUser.email}
                    </div>
                </div>
            </div>
        );
    }

    private _logout(): void {
        this._authService.logout();
    }

    private _toggleThemeMode(): void {
        this._themeService.toggleThemeMode();
    }

    private _handleThemeChange(theme: Theme) {
        const themeMode = this._themeService.themeMode;
        this.setState({ themeMode });
    }

});
