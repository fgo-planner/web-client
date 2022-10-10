import { useEffect } from 'react';
import { LockableFeature, UserInterfaceService } from '../../services/user-interface/user-interface.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Utility hook for temporarily disabling navigation drawer animations while the
 * component is mounted.
 */
export const useNavigationDrawerNoAnimations = (): void => {

    const userInterfaceService = useInjectable(UserInterfaceService);

    useEffect(() => {
        const lockId = userInterfaceService.requestLock(LockableFeature.NavigationDrawerNoAnimations);

        return () => userInterfaceService.releaseLock(LockableFeature.NavigationDrawerNoAnimations, lockId);
    }, [userInterfaceService]);

};
