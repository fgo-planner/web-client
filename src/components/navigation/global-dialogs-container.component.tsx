import { Nullable } from '@fgo-planner/common-core';
import { PaperProps } from '@mui/material';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInjectable } from '../../hooks/dependency-injection/use-injectable.hook';
import { UserInterfaceService } from '../../services/user-interface/user-interface.service';
import { UserInfo } from '../../types/internal';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';
import { LoginDialog } from '../login/login-dialog.component';

const LoginDialogPaperProps: PaperProps = {
    style: {
        minWidth: 360
    }
};

const LoginDialogDisabledPathsRegex = new RegExp('login|register|forgot-password');

/**
 * Whether to redirect the user to the login page instead of open the login
 * dialog, based on current location. This special behavior currently applies to
 * the following routes:
 * - /login
 * - /register
 * - /forgot-password
 */
const shouldRedirectToLoginRoute = (pathname: string): boolean => {
    return LoginDialogDisabledPathsRegex.test(pathname);
};

export const GlobalDialogs = React.memo(() => {

    const location = useLocation();
    const navigate = useNavigate();

    const userInterfaceService = useInjectable(UserInterfaceService);

    const [user, setUser] = useState<Nullable<UserInfo>>();
    const [loginDialogOpen, setLoginDialogOpen] = useState<boolean>(false);

    /*
     * User change subscription.
     */
    useEffect(() => {
        const onCurrentUserChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentUserChange)
            .subscribe(setUser);

        return () => onCurrentUserChangeSubscription.unsubscribe();
    }, []);

    /*
     * Login dialog open state change subscription
     */
    useEffect(() => {
        const onLoginDialogOpenChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.LoginDialogOpenChange)
            .subscribe((open: boolean): void => {
                if (!open) {
                    return setLoginDialogOpen(false);
                }
                if (shouldRedirectToLoginRoute(location.pathname)) {
                    navigate('/login');
                    userInterfaceService.setLoginDialogOpen(false);
                } else {
                    setLoginDialogOpen(true);
                }
            });

        return () => onLoginDialogOpenChangeSubscription.unsubscribe();
    }, [location.pathname, navigate, userInterfaceService]);

    const handleLoginDialogClose = useCallback((): void => {
        userInterfaceService.setLoginDialogOpen(false);
    }, [userInterfaceService]);

    const loginDialog: ReactNode = !user && <LoginDialog
        PaperProps={LoginDialogPaperProps}
        open={loginDialogOpen}
        onClose={handleLoginDialogClose}
    />;

    return <>
        {loginDialog}
    </>;

});
