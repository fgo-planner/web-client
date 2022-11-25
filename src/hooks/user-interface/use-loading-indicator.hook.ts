import { useCallback, useEffect, useRef } from 'react';
import { LockableFeature, UserInterfaceService } from '../../services/user-interface/user-interface.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

type LoadingIndicatorHookResult = {
    /**
     * Invokes a loading indicator for the component. If there is already an active
     * loading indicator for the component, then this will not do anything.
     *
     * Guaranteed to be stable between re-renders . Calling this function will not
     * invoke a component re-render.
     */
    invokeLoadingIndicator: () => void;
    /**
     * Resets the active loading indicator for the component. If there is not an
     * active loading indicator for the component, then this will not do anything.
     *
     * This will be automatically called when the component is unmounted to prevent
     * loading indicators from being permanently displayed.
     *
     * Guaranteed to be stable between re-renders . Calling this function will not
     * invoke a component re-render.
     */
    resetLoadingIndicator: () => void;
    /**
     * Whether the loading indicator is active for the component.
     */
    isLoadingIndicatorActive: boolean;
};

export const useLoadingIndicator = (): LoadingIndicatorHookResult => {

    const userInterfaceService = useInjectable(UserInterfaceService);

    const lockIdRef = useRef<string>();

    const invokeLoadingIndicator = useCallback((): void => {
        if (!lockIdRef.current) {
            lockIdRef.current = userInterfaceService.requestLock(LockableFeature.LoadingIndicator);
        }
    }, [userInterfaceService]);

    const resetLoadingIndicator = useCallback((): void => {
        if (lockIdRef.current) {
            userInterfaceService.releaseLock(LockableFeature.LoadingIndicator, lockIdRef.current);
            lockIdRef.current = undefined;
        }
    }, [userInterfaceService]);

    /**
     * Resets the loading indicator for the component if it is still active when the
     * component is unmounted.
     */
    useEffect(() => resetLoadingIndicator, [resetLoadingIndicator]);

    const isLoadingIndicatorActive = !!lockIdRef.current;

    return {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    };

};
