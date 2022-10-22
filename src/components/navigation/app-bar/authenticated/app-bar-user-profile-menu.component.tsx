import { AccountCircle as AccountCircleIcon, ExitToApp as ExitToAppIcon, InfoOutlined as InfoOutlinedIcon, NightsStay as NightsStayIcon, Settings as SettingsIcon, SupervisedUserCircleOutlined as SupervisedUserCircleIcon, VolumeOff as VolumeOffIcon, VolumeUp as VolumeUpIcon, WbSunny as WbSunnyIcon } from '@mui/icons-material';
import { Avatar, Divider } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { BackgroundMusicService } from '../../../../services/audio/background-music.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { BasicUser } from '../../../../services/data/user/user.service';
import { ThemeService } from '../../../../services/user-interface/theme.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { ModalOnCloseHandler, ThemeInfo } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { AppBarActionMenuItem } from '../action-menu/app-bar-action-menu-item.component';
import { AppBarActionMenu } from '../action-menu/app-bar-action-menu.component';

type Props = {
    currentUser: BasicUser;
    anchorEl?: Element | null;
    onClose?: ModalOnCloseHandler;
};

const MenuWidth = 280;

const AvatarSize = 56;

const StyleClassPrefix = 'AppBarUserProfileMenu';

const StyleProps = {
    width: MenuWidth,
    [`& .${StyleClassPrefix}-menu-header`]: {
        display: 'flex',
        px: 4,
        pt: 2,
        pb: 3,
        outline: 'none'
    },
    [`& .${StyleClassPrefix}-avatar`]: {
        width: AvatarSize,
        height: AvatarSize,
        mr: 3
    },
    [`& .${StyleClassPrefix}-user-info`]: {
        maxWidth: 180 // TODO Un-hardcode this
    },
    [`& .${StyleClassPrefix}-username`]: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '1rem',
        fontWeight: 500,
        color: 'text.primary',
        mb: 1
    },
    [`& .${StyleClassPrefix}-email`]: {
        fontFamily: ThemeConstants.FontFamilyRoboto,
        fontSize: '0.875rem',
        color: 'text.secondary',
    }
} as SystemStyleObject<Theme>;

export const AppBarUserProfileMenu = React.memo((props: Props) => {

    const { currentUser, anchorEl, onClose } = props;

    const authenticationService = useInjectable(AuthenticationService);
    const backgroundMusicService = useInjectable(BackgroundMusicService);
    const themeService = useInjectable(ThemeService);

    const [themeInfo, setThemeInfo] = useState<ThemeInfo>();
    const [isBackgroundMusicPlaying, setIsBackgroundMusicPlaying] = useState<boolean>(false);

    useEffect(() => {
        const onThemeChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.ThemeChange)
            .subscribe(setThemeInfo);
        const onPlayStatusChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.Audio.BackgroundPlayStatusChange)
            .subscribe(setIsBackgroundMusicPlaying);

        return () => {
            onThemeChangeSubscription.unsubscribe();
            onPlayStatusChangeSubscription.unsubscribe();
        };
    }, []);

    const handleLogout = useCallback((): void => {
        authenticationService.logout();
    }, [authenticationService]);

    const handleThemeModeToggle = useCallback((): void => {
        themeService.toggleThemeMode();
    }, [themeService]);

    const handleBackgroundMusicButtonClick = useCallback((): void => {
        if (isBackgroundMusicPlaying) {
            backgroundMusicService.pause();
        } else {
            backgroundMusicService.play();
        }
    }, [backgroundMusicService, isBackgroundMusicPlaying]);


    const menuHeaderNode = (
        <div className={`${StyleClassPrefix}-menu-header`}>
            <Avatar className={`${StyleClassPrefix}-avatar`} src='https://assets.atlasacademy.io/GameData/JP/MasterFace/equip00052.png' />
            <div className={`${StyleClassPrefix}-user-info`}>
                <div className={clsx(`${StyleClassPrefix}-username`, 'truncate')}>
                    {currentUser.username}
                </div>
                <div className={clsx(`${StyleClassPrefix}-email`, 'truncate')}>
                    {currentUser.email}
                </div>
            </div>
        </div>
    );

    const isLightMode = themeInfo?.themeMode === 'light';

    return (
        <AppBarActionMenu
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            anchorEl={anchorEl}
            onClose={onClose}
        >
            {menuHeaderNode}
            <Divider />
            <AppBarActionMenuItem
                label='Settings'
                icon={SettingsIcon}
                to='/user/settings'
            />
            <AppBarActionMenuItem
                label='Master Accounts'
                icon={SupervisedUserCircleIcon}
                to='/user/master-accounts'
            />
            <AppBarActionMenuItem
                label='Log Out'
                icon={ExitToAppIcon}
                onClick={handleLogout}
            />
            <Divider />
            <AppBarActionMenuItem
                label={`Appearance: ${isLightMode ? 'Light' : 'Dark'}`}
                icon={isLightMode ? WbSunnyIcon : NightsStayIcon}
                onClick={handleThemeModeToggle}
            />
            <AppBarActionMenuItem
                label={`Music: ${isBackgroundMusicPlaying ? 'On' : 'Off'}`}
                icon={isBackgroundMusicPlaying ? VolumeUpIcon : VolumeOffIcon}
                onClick={handleBackgroundMusicButtonClick}
            />
            <AppBarActionMenuItem
                label='About'
                icon={InfoOutlinedIcon}
                to='/about'
            />
        </AppBarActionMenu>
    );

});
