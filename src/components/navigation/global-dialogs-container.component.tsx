import { PaperProps } from '@mui/material';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { useInjectable } from '../../hooks/dependency-injection/use-injectable.hook';
import { UserInterfaceService } from '../../services/user-interface/user-interface.service';
import { Nullable, UserInfo } from '../../types/internal';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';
import { LoginDialog } from '../login/login-dialog.component';

const LoginDialogPaperProps: PaperProps = {
    style: {
        minWidth: 360
    }
};

export const GlobalDialogs = React.memo(() => {

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
            .subscribe(setLoginDialogOpen);

        return () => onLoginDialogOpenChangeSubscription.unsubscribe();
    }, []);

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
