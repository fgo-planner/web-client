import { useCallback, useEffect, useState } from 'react';
import { LockableFeature, UserInterfaceService } from '../../services/user-interface/user-interface.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

type LoadingIndicatorHookResult = {
    /**
     * Invokes a loading indicator for the component. If there is already an active
     * loading indicator for the component, then this will not do anything.
     * 
     * Guaranteed to be stable between rerenders.
     */
    invokeLoadingIndicator: () => void;
    /**
     * Resets the active loading indicator for the component. If there is not an
     * active loading indicator for the component, then this will not do anything.
     *
     * This will be automatically called when the component is unmounted to prevent
     * loading indicators from being permanently displayed.
     *
     * Guaranteed to be stable between rerenders.
     */
    resetLoadingIndicator: () => void;
    /**
     * Whether the loading indicator is active for the component.
     */
    isLoadingIndicatorActive: boolean;
};

export const useLoadingIndicator = (): LoadingIndicatorHookResult => {

    const userInterfaceService = useInjectable(UserInterfaceService);

    const [lockId, setLockId] = useState<string>();

    const invokeLoadingIndicator = useCallback((): void => {
        setLockId(lockId => {
            if (!lockId) {
                lockId = userInterfaceService.requestLock(LockableFeature.LoadingIndicator, true);
            }
            return lockId;
        });
    }, [userInterfaceService]);

    const resetLoadingIndicator = useCallback((): void => {
        setLockId(lockId => {
            if (lockId) {
                userInterfaceService.releaseLock(LockableFeature.LoadingIndicator, lockId, true);
                lockId = undefined;
            }
            return lockId;
        });
    }, [userInterfaceService]);

    /**
     * Resets the loading indicator for the component if it is still active when the
     * component is unmounted.
     */
    useEffect(() => resetLoadingIndicator, [resetLoadingIndicator]);

    const isLoadingIndicatorActive = !!lockId;

    return {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    };

};
