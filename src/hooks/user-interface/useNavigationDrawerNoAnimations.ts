import { useEffect } from 'react';
import { UserInterfaceService } from '../../services/user-interface/UserInterfaceService';
import { LockableUIFeature } from '../../types/dto/LockableUIFeature.enum';
import { useInjectable } from '../dependency-injection/useInjectable';

/**
 * Utility hook for temporarily disabling navigation drawer animations while the
 * component is mounted.
 */
export const useNavigationDrawerNoAnimations = (): void => {

    const userInterfaceService = useInjectable(UserInterfaceService);

    useEffect(() => {
        /**
         * This needs to be called asynchronously due to potential race condition with
         * the `ThemeService` releasing the lock.
         */
        /** */
        const lockId = userInterfaceService.requestLock(LockableUIFeature.NavigationDrawerNoAnimations);

        return () => userInterfaceService.releaseLock(LockableUIFeature.NavigationDrawerNoAnimations, lockId);
    }, [userInterfaceService]);

};
