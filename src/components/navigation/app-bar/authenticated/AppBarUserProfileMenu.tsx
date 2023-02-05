import { Avatar, Divider } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { useInjectable } from '../../../../hooks/dependency-injection/useInjectable';
import { BackgroundMusicService } from '../../../../services/audio/BackgroundMusicService';
import { AuthenticationService } from '../../../../services/authentication/AuthenticationService';
import { BasicUser } from '../../../../services/data/user/UserService';
import { ThemeService } from '../../../../services/user-interface/ThemeService';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { ModalOnCloseHandler, ThemeInfo } from '../../../../types';
import { SubscribablesContainer } from '../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../utils/subscription/SubscriptionTopics';
import { AppBarActionMenu } from '../action-menu/AppBarActionMenu';
import { AppBarActionMenuItem } from '../action-menu/AppBarActionMenuItem';

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
                icon='manage_accounts'
                to='/user/settings'
            />
            <AppBarActionMenuItem
                label='Master Accounts'
                icon='supervised_user_circle'
                iconVariant='outlined'
                to='/user/master-accounts'
            />
            <AppBarActionMenuItem
                label='Log Out'
                icon='exit_to_app'
                onClick={handleLogout}
            />
            <Divider />
            <AppBarActionMenuItem
                label={`Appearance: ${isLightMode ? 'Light' : 'Dark'}`}
                icon={isLightMode ? 'wb_sunny' : 'nights_stay'}
                onClick={handleThemeModeToggle}
            />
            <AppBarActionMenuItem
                label={`Music: ${isBackgroundMusicPlaying ? 'On' : 'Off'}`}
                icon={isBackgroundMusicPlaying ? 'volume_up' : 'volume_off'}
                onClick={handleBackgroundMusicButtonClick}
            />
            <AppBarActionMenuItem
                label='About'
                icon='info'
                iconVariant='outlined'
                to='/about'
            />
        </AppBarActionMenu>
    );

});
