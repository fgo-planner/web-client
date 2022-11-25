import { Nullable } from '@fgo-planner/common-core';
import { PaperProps } from '@mui/material';
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { GlobalDialog, GlobalDialogOpenAction, ModalOnCloseReason, NavigationBlockerDialogOpenAction, UserTokenPayload } from '../../types';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';
import { PromptDialog } from '../dialog/prompt-dialog.component';
import { LoginDialog } from '../login/login-dialog.component';

const LoginDialogPaperProps: PaperProps = {
    style: {
        minWidth: 360
    }
};

const NavigationBlockerDialogPaperProps: PaperProps = {
    style: {
        minWidth: 360,
        maxWidth: 600
    }
};

/**
 * Clean up
 */
const closeActiveDialogAction = (activeDialogAction?: GlobalDialogOpenAction): undefined => {
    activeDialogAction?.onClose();
    return undefined;
};

export const GlobalDialogs = React.memo(() => {

    const [user, setUser] = useState<Nullable<UserTokenPayload>>();

    const [activeDialogAction, setActiveDialogAction] = useState<GlobalDialogOpenAction>();

    /**
     * User change subscription.
     */
    useEffect(() => {
        const onCurrentUserChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentUserChange)
            .subscribe(setUser);

        return () => onCurrentUserChangeSubscription.unsubscribe();
    }, []);

    /**
     * Dialog action subscriptions.
     */
    useEffect(() => {
        const onLoginDialogOpenChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.GlobalDialogAction)
            .subscribe(setActiveDialogAction);

        return () => onLoginDialogOpenChangeSubscription.unsubscribe();
    }, []);

    
    //#region Login dialog
    
    const handleLoginDialogClose = useCallback((_event: any, _reason: ModalOnCloseReason): void => {
        setActiveDialogAction(closeActiveDialogAction);
    }, []);
    
    const loginDialog: ReactNode = useMemo((): ReactNode => {
        /**
         * Don't render the login dialog if the user is already logged in.
         */
        if (user) {
            return null;
        }
        
        const open = activeDialogAction?.dialog === GlobalDialog.Login;
        return (
            <LoginDialog
                PaperProps={LoginDialogPaperProps}
                open={open}
                onClose={handleLoginDialogClose}
            />
        );
    }, [activeDialogAction, handleLoginDialogClose, user]);

    //#endregion


    //#region Navigation blocker dialog

    const handleNavigationBlockerDialogClose = useCallback((_event: any, reason: ModalOnCloseReason): void => {
        setActiveDialogAction(activeDialogAction => {
            if (!activeDialogAction) {
                return undefined;
            }
            const { options } = activeDialogAction as NavigationBlockerDialogOpenAction;
            if (reason === 'submit') {
                options.onConfirm();
            } else {
                options.onCancel();
            }
            return closeActiveDialogAction(activeDialogAction);
        });
    }, []);

    const navigationBlockerDialog: ReactNode = useMemo((): ReactNode => {
        let open = false;
        let prompt: ReactNode;
        let title: string | undefined;
        let cancelButtonLabel: string | undefined;
        let confirmButtonLabel: string | undefined;

        if (activeDialogAction?.dialog === GlobalDialog.NavigationBlocker) {
            const options = activeDialogAction.options;
            prompt = options.prompt;
            title = options.title;
            cancelButtonLabel =options.cancelButtonLabel;
            confirmButtonLabel =options.confirmButtonLabel;
            open = true;
        }

        return (
            <PromptDialog
                PaperProps={NavigationBlockerDialogPaperProps}
                open={open}
                title={title}
                prompt={prompt}
                cancelButtonLabel={cancelButtonLabel}
                confirmButtonLabel={confirmButtonLabel}
                onClose={handleNavigationBlockerDialogClose}
            />
        );
    }, [activeDialogAction, handleNavigationBlockerDialogClose]);

    //#endregion


    return <>
        {loginDialog}
        {navigationBlockerDialog}
    </>;

});
