import React, { useEffect, useState } from 'react';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';
import { LoadingIndicator } from './loading-indicator.component';

export const LoadingIndicatorOverlay = React.memo(() => {

    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        const onDisplayStatusChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.LoadingIndicatorDisplayChange)
            .subscribe(setVisible);

        return () => onDisplayStatusChangeSubscription.unsubscribe();
    }, []);

    return <LoadingIndicator visible={visible} />;

});
