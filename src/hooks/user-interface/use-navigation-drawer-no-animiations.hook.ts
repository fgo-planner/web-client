import { useEffect } from 'react';
import { UserInterfaceService } from '../../services/user-interface/user-interface.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Utility hook for temporarily disabling navigation drawer animations while the
 * component is mounted.
 */
export const useNavigationDrawerNoAnimations = (): void => {

    const userInterfaceService = useInjectable(UserInterfaceService);

    useEffect(() => {
        const invocationId = userInterfaceService.invokeNavigationDrawerNoAnimations();

        return () => userInterfaceService.waiveNavigationDrawerNoAnimations(invocationId);
    }, [userInterfaceService]);

};
