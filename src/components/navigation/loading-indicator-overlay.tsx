import React, { useEffect, useState } from 'react';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../utils/subscription/subscription-topic';
import { LoadingIndicator } from '../utils/loading-indicator.component';

export const LoadingIndicatorOverlay = React.memo(() => {

    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        const onDisplayStatusChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopic.UserInterface_LoadingIndicatorDisplayChange)
            .subscribe(setVisible);

        return () => onDisplayStatusChangeSubscription.unsubscribe();
    }, []);

    return <LoadingIndicator visible={visible} />;

});
