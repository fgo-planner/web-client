import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useInjectable } from '../../hooks/dependency-injection/useInjectable';
import { AuthenticationService } from '../../services/authentication/AuthenticationService';
import { SubscribablesContainer } from '../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../utils/subscription/SubscriptionTopics';

/**
 * A wrapper utility component that prevents children components from being
 * rendered and navigates the user back to the login page if the user is not
 * authenticated (logged in).
 */
export const RequireAuthentication = React.memo(({ children }: PropsWithChildren<{}>) => {

    const authenticationService = useInjectable(AuthenticationService);

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(authenticationService.isLoggedIn);

    useEffect(() => {
        const onCurrentUserChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentUserChange)
            .subscribe(() => setIsLoggedIn(authenticationService.isLoggedIn));

        return () => onCurrentUserChangeSubscription.unsubscribe();
    }, [authenticationService]);

    if (!isLoggedIn) {
        return <Navigate to='/' />;
    }

    return <>
        {children}
    </>;

});
