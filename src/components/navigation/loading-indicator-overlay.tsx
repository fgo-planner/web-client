import React, { useEffect, useState } from 'react';
import { LoadingIndicatorOverlayService } from '../../services/user-interface/loading-indicator-overlay.service';
import { LoadingIndicator } from '../utils/loading-indicator.component';

export const LoadingIndicatorOverlay = React.memo(() => {

    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        const onDisplayStatusChangeSubscription = LoadingIndicatorOverlayService.onDisplayStatusChange
            .subscribe(setVisible);

        return () => onDisplayStatusChangeSubscription.unsubscribe();
    }, []);

    return <LoadingIndicator visible={visible} />;

});
