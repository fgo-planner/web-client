import { History, Transition } from 'history';
import { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UNSAFE_NavigationContext, useLocation, useNavigate } from 'react-router-dom';
import { UserInterfaceService } from '../../services/user-interface/UserInterfaceService';
import { NavigationBlockerDialogOptions } from '../../types';
import { useInjectable } from '../dependency-injection/useInjectable';

export type UseBlockNavigationOptions = {
    cancelButtonLabel?: string;
    confirmButtonLabel?: string;
    prompt?: ReactNode;
    title?: string;
};

const DefaultPrompt = 'Are you sure you want to leave this page?';

/**
 * Prevents user from navigating away from the current route.
 * 
 * @see https://dev.to/bangash1996/detecting-user-leaving-page-with-react-router-dom-v602-33ni
 */
export function useBlockNavigation(enabled: boolean, options: UseBlockNavigationOptions = {}): void {

    const location = useLocation();
    const navigate = useNavigate();
    const navigator = useContext(UNSAFE_NavigationContext).navigator as History;

    const userInterfaceService = useInjectable(UserInterfaceService);

    const [confirmed, setConfirmed] = useState<boolean>(false);
    const [, setTargetPathname] = useState<string>();

    const handleConfirm = useCallback(() => {
        setConfirmed(true);
        setTargetPathname(targetPathName => {
            if (targetPathName) {
                console.debug('Confirmed navigation to', targetPathName);
                setTimeout(() => {
                    navigate(targetPathName);
                    /**
                     * Reset state
                     */
                    setConfirmed(false);
                    setTargetPathname(undefined);
                });
            }
            return undefined;
        });
    }, [navigate]);

    const handleCancel = useCallback(() => {
        setConfirmed(false);
        setTargetPathname(undefined);
    }, []);

    const {
        cancelButtonLabel,
        confirmButtonLabel,
        prompt = DefaultPrompt,
        title
    } = options;

    const navigationBlockerDialogOptions = useMemo((): NavigationBlockerDialogOptions => ({
        cancelButtonLabel,
        confirmButtonLabel,
        onCancel: handleCancel,
        onConfirm: handleConfirm,
        prompt,
        title
    }), [cancelButtonLabel, confirmButtonLabel, handleCancel, handleConfirm, prompt, title]);

    useEffect(() => {
        if (!enabled || confirmed) {
            return;
        }

        /**
         * WARNING The `navigator.block` method was removed in the newer versions of
         * `react-router-dom`. Do not upgrade unless there is an alternative solution on
         * hand.
         */

        /** */
        const unblock = navigator.block((transition: Transition): void => {
            const targetPathName = transition.location.pathname;
            /**
             * Only block navigation if the current and target pathnames are different.
             */
            if (location.pathname !== targetPathName) {
                userInterfaceService.openNavigationBlockerDialog(navigationBlockerDialogOptions);
                setTargetPathname(targetPathName);
                console.debug('Blocked navigation attempt to', targetPathName);
            }
        });

        return unblock;
    }, [confirmed, enabled, location.pathname, navigationBlockerDialogOptions, navigator, userInterfaceService]);

}
