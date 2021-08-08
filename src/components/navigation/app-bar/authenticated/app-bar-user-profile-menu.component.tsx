import { Avatar, Divider, StyleRules, Theme, withStyles } from '@material-ui/core';
import { AccountCircle as AccountCircleIcon, ExitToApp as ExitToAppIcon, InfoOutlined as InfoOutlinedIcon, NightsStay as NightsStayIcon, Settings as SettingsIcon, SupervisedUserCircleOutlined as SupervisedUserCircleIcon, VolumeOff as VolumeOffIcon, VolumeUp as VolumeUpIcon, WbSunny as WbSunnyIcon } from '@material-ui/icons';
import { PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../../../services/authentication/auth.service';
import { BasicUser } from '../../../../services/data/user/user.service';
import { BackgroundMusicService } from '../../../../services/audio/background-music.service';
import { ThemeInfo, ThemeService } from '../../../../services/user-interface/theme.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { ModalOnCloseHandler, WithStylesProps } from '../../../../types/internal';
import { AppBarActionMenuItem } from '../action-menu/app-bar-action-menu-item.component';
import { AppBarActionMenu } from '../action-menu/app-bar-action-menu.component';

type Props = {
    anchorEl?: Element | null;
    onClose?: ModalOnCloseHandler;
    currentUser: BasicUser;
} & WithStylesProps;

type State = {
    themeInfo?: ThemeInfo;
    isBackgroundMusicPlaying: boolean;
};

const style = (theme: Theme) => ({
    root: {
        width: '280px' // TODO Un-hardcode this
    },
    menuHeader: {
        display: 'flex',
        padding: theme.spacing(2, 4, 3, 4),
        outline: 'none'
    },
    avatar: {
        width: theme.spacing(14),
        height: theme.spacing(14),
        marginRight: theme.spacing(3)
    },
    userInfo: {
        maxWidth: '180px' // TODO Un-hardcode this
    },
    username: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '1rem',
        fontWeight: 500,
        color: theme.palette.text.primary
    },
    email: {
        fontFamily: theme.typography.fontFamily,
        fontSize: '0.875rem',
        color: theme.palette.text.secondary
    }
} as StyleRules);

export const AppBarUserProfileMenu = withStyles(style)(class extends PureComponent<Props, State> {

    private _onThemeChangeSubscription!: Subscription;

    private _onPlayStatusChangeSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            isBackgroundMusicPlaying: false
        };
        this._logout = this._logout.bind(this);
        this._toggleThemeMode = this._toggleThemeMode.bind(this);
        this._handleBackgroundMusicButtonClick = this._handleBackgroundMusicButtonClick.bind(this);
    }

    componentDidMount(): void {
        this._onThemeChangeSubscription = ThemeService.onThemeChange
            .subscribe(this._handleThemeChange.bind(this));
        this._onPlayStatusChangeSubscription = BackgroundMusicService.onPlayStatusChange
            .subscribe(this._handleBackgroundMusicPlayStatusChange.bind(this));
    }

    componentWillUnmount(): void {
        this._onThemeChangeSubscription.unsubscribe();
    }

    render(): ReactNode {
        const { themeInfo, isBackgroundMusicPlaying } = this.state;
        const isLightMode = themeInfo?.themeMode === 'light';
        return (
            <AppBarActionMenu
                className={this.props.classes.root}
                anchorEl={this.props.anchorEl}
                onClose={this.props.onClose}
            >
                {this._renderMenuHeader()}
                <Divider />
                <AppBarActionMenuItem
                    label="Profile"
                    icon={AccountCircleIcon}
                    to="/user/profile"
                />
                <AppBarActionMenuItem
                    label="Settings"
                    icon={SettingsIcon}
                    to="/user/settings"
                />
                <AppBarActionMenuItem
                    label="Master Accounts"
                    icon={SupervisedUserCircleIcon}
                    to="/user/master-accounts"
                />
                <AppBarActionMenuItem
                    label="Log Out"
                    icon={ExitToAppIcon}
                    onClick={this._logout}
                />
                <Divider />
                <AppBarActionMenuItem
                    label={`Appearance: ${isLightMode ? 'Light' : 'Dark'}`}
                    icon={isLightMode ? WbSunnyIcon : NightsStayIcon}
                    onClick={this._toggleThemeMode}
                />
                <AppBarActionMenuItem
                    label={`Music: ${isBackgroundMusicPlaying ? 'On' : 'Off'}`}
                    icon={isBackgroundMusicPlaying ? VolumeUpIcon : VolumeOffIcon}
                    onClick={this._handleBackgroundMusicButtonClick}
                />
                <AppBarActionMenuItem
                    label="About"
                    icon={InfoOutlinedIcon}
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
        AuthenticationService.logout();
    }

    private _toggleThemeMode(): void {
        ThemeService.toggleThemeMode();
    }

    private _handleBackgroundMusicButtonClick(): void {
        if (this.state.isBackgroundMusicPlaying) {
            BackgroundMusicService.pause();
        } else {
            BackgroundMusicService.play();
        }
    }

    private _handleThemeChange(themeInfo: ThemeInfo): void {
        this.setState({ themeInfo });
    }

    private _handleBackgroundMusicPlayStatusChange(isPlaying: boolean): void {
        this.setState({ isBackgroundMusicPlaying: isPlaying });
    }

});
