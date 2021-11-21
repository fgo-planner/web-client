import React, { Fragment, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { AuthenticationService } from '../../services/authentication/auth.service';

/**
 * A wrapper utility component that prevents children components from being
 * rendered and navigates the user back to the login page if the user is not
 * authenticated (logged in).
 */
export const RequireAuthentication = React.memo(({ children }) => {

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(AuthenticationService.isLoggedIn);

    useEffect(() => {
        const onCurrentUserChangeSubscription = AuthenticationService.onCurrentUserChange
            .subscribe(() => setIsLoggedIn(AuthenticationService.isLoggedIn));

        return () => onCurrentUserChangeSubscription.unsubscribe();
    }, []);

    if (!isLoggedIn) {
        return <Navigate to="/" />;
    }

    return <Fragment>{children}</Fragment>;

});
