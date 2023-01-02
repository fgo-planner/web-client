import { Nullable } from '@fgo-planner/common-core';
import { IconButton, Theme } from '@mui/material';
import { Box, SystemStyleObject } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { BasicUser, UserService } from '../../../services/data/user/user.service';
import { UserInterfaceService } from '../../../services/user-interface/user-interface.service';
import { ThemeConstants } from '../../../styles/theme-constants';
import { SxPropsFunction } from '../../../types';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';
import { IconOutlined } from '../../icons';
import { AppBarAuthenticatedUser } from './authenticated/AppBarAuthenticatedUser';
import { AppBarGuestUser } from './guest/AppBarGuestUser';

const StyleClassPrefix = 'AppBar';

const StyleProps = ((theme: Theme) => {
    const {
        breakpoints,
        palette,
        shadows,
        spacing
    } = theme;

    return {
        height: spacing(ThemeConstants.AppBarHeightScale),
        bgcolor: palette.background.default,
        transition: 'box-shadow 200ms 50ms linear',
        backgroundImage: 'none',
        boxShadow: `0px 1px 0px ${palette.divider}`, // Simulates 1px solid border
        [`&.${StyleClassPrefix}-elevated`]: {
            boxShadow: shadows[ThemeConstants.AppBarElevatedElevation]
        },
        [`& .${StyleClassPrefix}-contents`]: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            pl: 2,
            [`& .${StyleClassPrefix}-title`]: {
                fontFamily: ThemeConstants.FontFamilyGoogleSans,
                fontSize: '24px',
                color: 'text.primary',
                textDecoration: 'none',
                pl: 4,
                mr: 6,
                [breakpoints.down('lg')]: {
                    display: 'none'
                }
            }
        },
        [breakpoints.down('lg')]: {
            // bgcolor: palette.drawer?.main,
            // boxShadow: 'none',
            height: spacing(ThemeConstants.AppBarHeightScaleCondensed)
        }    
    } as SystemStyleObject;
}) as SxPropsFunction;

/**
 * The app bar component.
 */
export const AppBar = React.memo(() => {

    const userInterfaceService = useInjectable(UserInterfaceService);
    const userService = useInjectable(UserService);

    const [currentUser, setCurrentUser] = useState<Nullable<BasicUser>>();
    const [elevated, setElevated] = useState<boolean>(false);

    /**
     * Current user change subscription.
     */
    useEffect(() => {
        const onCurrentUserChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentUserChange)
            .subscribe(async (userInfo) => {
                if (userInfo) {
                    try {
                        const currentUser = await userService.getCurrentUser();
                        setCurrentUser(currentUser);
                    } catch {
                        setCurrentUser(null);
                    }
                } else {
                    setCurrentUser(null);
                }
            });

        return () => onCurrentUserChangeSubscription.unsubscribe();
    }, [userService]);

    /**
     * App bar elevation change subscription.
     */
    useEffect(() => {
        const onElevatedChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.AppBarElevatedChange)
            .subscribe(setElevated);

        return () => onElevatedChangeSubscription.unsubscribe();
    }, []);

    const handleNavigationDrawerButtonClick = useCallback((): void => {
        userInterfaceService.toggleNavigationDrawerOpen();
    }, [userInterfaceService]);

    const className = clsx(
        `${StyleClassPrefix}-root`,
        elevated && `${StyleClassPrefix}-elevated`
    );

    return (
        <Box className={className} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-contents`}>
                {/* TODO Hide menu button in desktop view */}
                <IconButton onClick={handleNavigationDrawerButtonClick}>
                    <IconOutlined>menu</IconOutlined>
                </IconButton>
                {/* TODO Add logo */}
                <Link className={`${StyleClassPrefix}-title`} to='/'>
                    FGO Servant Planner
                </Link>
                {currentUser ?
                    <AppBarAuthenticatedUser currentUser={currentUser} /> :
                    <AppBarGuestUser />
                }
            </div>
        </Box>
    );

});
