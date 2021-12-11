import { Paper } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { BasicUser, UserService } from '../../../services/data/user/user.service';
import { AppBarService } from '../../../services/user-interface/app-bar.service';
import { ThemeConstants } from '../../../styles/theme-constants';
import { AppBarAuthenticatedUser } from './authenticated/app-bar-authenticated-user.component';
import { AppBarGuestUser } from './guest/app-bar-guest-user.component';

const StyleClassPrefix = 'AppBar';

const StyleProps = (theme: Theme) => ({
    height: theme.spacing(ThemeConstants.AppBarHeightScale),
    bgcolor: 'background.default',
    transition: 'box-shadow 200ms 50ms linear',
    backgroundImage: 'none',
    '&.no-elevation': {
        // Simulates 1px solid border
        // boxShadow: `0px 1px 0px ${theme.palette.divider}`
        boxShadow: 'none'
    },
    [`& .${StyleClassPrefix}-background-image`]: {
        height: theme.spacing(ThemeConstants.AppBarHeightScale),
    },
    [`& .${StyleClassPrefix}-contents`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        pl: 4
    },
    [`& .${StyleClassPrefix}-title`]: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '24px',
        color: 'text.primary',
        textDecoration: 'none',
        mr: 6,
        [theme.breakpoints.down('lg')]: {
            display: 'none'
        }
    }
} as SystemStyleObject<Theme>);

/**
 * The app bar component.
 */
export const AppBar = React.memo(() => {

    const authenticationService = useInjectable(AuthenticationService);
    const userService = useInjectable(UserService);

    const [currentUser, setCurrentUser] = useState<BasicUser>();
    const [elevated, setElevated] = useState<boolean>(false);

    /**
     * onCurrentUserChangeSubscription subscriptions
     */
    useEffect(() => {
        const onCurrentUserChangeSubscription = authenticationService.onCurrentUserChange
            .subscribe(async (userInfo) => {
                if (userInfo) {
                    // TODO Handle error
                    const currentUser = await userService.getCurrentUser();
                    setCurrentUser(currentUser);
                } else {
                    setCurrentUser(undefined);
                }
            });

        return () => onCurrentUserChangeSubscription.unsubscribe();
    }, [authenticationService.onCurrentUserChange, userService]);

    /**
     * onElevatedChangeSubscription subscriptions
     */
    useEffect(() => {
        const onElevatedChangeSubscription = AppBarService.onElevatedChange
            .subscribe(setElevated);

        return () => onElevatedChangeSubscription.unsubscribe();
    }, []);

    return (
        <Paper
            className={clsx(`${StyleClassPrefix}-root`, !elevated && 'no-elevation')}
            sx={StyleProps}
            elevation={ThemeConstants.AppBarElevatedElevation}
            square={true}
        >
            {/* <ThemeBackground className={`${StyleClassPrefix}-background-image`} /> */}
            <div className={`${StyleClassPrefix}-contents`}>
                {/* TODO Add logo */}
                <Link className={`${StyleClassPrefix}-title`} to="/">
                    FGO Servant Planner
                </Link>
                {currentUser ?
                    <AppBarAuthenticatedUser currentUser={currentUser} /> :
                    <AppBarGuestUser />
                }
            </div>
        </Paper>
    );

});
