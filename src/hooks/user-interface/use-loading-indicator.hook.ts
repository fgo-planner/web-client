import { useCallback, useRef, useState } from 'react';
import { LoadingIndicatorOverlayService } from '../../services/user-interface/loading-indicator-overlay.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

export const useLoadingIndicator = (): [() => string, () => void, boolean] => {

    const loadingIndicatorOverlayService = useInjectable(LoadingIndicatorOverlayService);

    const [, setLoadingIndicatorId] = useState<string>();

    const loadingIndicatorIdRef = useRef<string>();

    const invoke = useCallback((): string => {
        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = loadingIndicatorOverlayService.invoke();
        }
        setLoadingIndicatorId(loadingIndicatorIdRef.current = loadingIndicatorId);
        return loadingIndicatorId;
    }, [loadingIndicatorOverlayService]);

    const reset = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            loadingIndicatorOverlayService.waive(loadingIndicatorId);
            setLoadingIndicatorId(loadingIndicatorIdRef.current = undefined);
        }
    }, [loadingIndicatorOverlayService]);

    const isActive = !!loadingIndicatorIdRef.current;

    return [invoke, reset, isActive];

};
