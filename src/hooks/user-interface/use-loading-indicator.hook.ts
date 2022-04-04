import { useCallback, useEffect, useRef, useState } from 'react';
import { LoadingIndicatorOverlayService } from '../../services/user-interface/loading-indicator-overlay.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

type LoadingIndicatorHookResult = {
    /**
     * Invokes a loading indicator for the component. If there is already an active
     * loading indicator for the component, then this will not do anything.
     * 
     * Guaranteed to be stable between rerenders.
     */
    invokeLoadingIndicator: () => string;
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

    const loadingIndicatorOverlayService = useInjectable(LoadingIndicatorOverlayService);

    const [, setLoadingIndicatorId] = useState<string>();

    const loadingIndicatorIdRef = useRef<string>();

    const invokeLoadingIndicator = useCallback((): string => {
        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = loadingIndicatorOverlayService.invoke();
        }
        setLoadingIndicatorId(loadingIndicatorIdRef.current = loadingIndicatorId);
        return loadingIndicatorId;
    }, [loadingIndicatorOverlayService]);

    const resetLoadingIndicator = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            loadingIndicatorOverlayService.waive(loadingIndicatorId);
            setLoadingIndicatorId(loadingIndicatorIdRef.current = undefined);
        }
    }, [loadingIndicatorOverlayService]);

    /*
     * Resets the loading indicator for the component if it is still active when the
     * component is unmounted.
     */
    useEffect(() => resetLoadingIndicator, [resetLoadingIndicator]);

    const isLoadingIndicatorActive = !!loadingIndicatorIdRef.current;

    return {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    };

};
