import { Button, Icon, IconButton } from '@mui/material';
import { Box, SystemStyleObject } from '@mui/system';
import React, { useCallback, useEffect, useState } from 'react';
import { useInjectable } from '../../../../hooks/dependency-injection/useInjectable';
import { BackgroundMusicService } from '../../../../services/audio/BackgroundMusicService';
import { ThemeService } from '../../../../services/user-interface/ThemeService';
import { UserInterfaceService } from '../../../../services/user-interface/UserInterfaceService';
import { ThemeInfo } from '../../../../types';
import { SubscribablesContainer } from '../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../utils/subscription/SubscriptionTopics';

// This component does not need StyleClassPrefix.

const StyleProps = {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    px: 4,
    py: 0,
    '& .MuiButton-root': {
        ml: 4
    }
} as SystemStyleObject;

/**
 * Renders the app bar contents for a guest (not logged in) user.
 */
export const AppBarGuestUser = React.memo(() => {

    const backgroundMusicService = useInjectable(BackgroundMusicService);
    const themeService = useInjectable(ThemeService);
    const userInterfaceService = useInjectable(UserInterfaceService);

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

    const handleLoginButtonClick = useCallback((): void => {
        userInterfaceService.openLoginDialog();
    }, [userInterfaceService]);

    return (
        <Box sx={StyleProps}>
            <IconButton size='large' onClick={handleThemeModeToggle}>
                <Icon>
                    {themeInfo?.themeMode === 'light' ? 'wb_sunny' : 'nights_stay'}
                </Icon>
            </IconButton>
            <IconButton size='large' onClick={handleBackgroundMusicButtonClick}>
                <Icon>
                    {isBackgroundMusicPlaying ? 'volume_up' : 'volume_off'}
                </Icon>
            </IconButton>
            <Button variant='contained' onClick={handleLoginButtonClick}>
                Log In
            </Button>
        </Box>
    );

});
