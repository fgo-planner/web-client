import React, { useEffect, useState } from 'react';
import { SubscribablesContainer } from '../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../utils/subscription/SubscriptionTopics';
import { LoadingIndicator } from './LoadingIndicator';

export const LoadingIndicatorOverlay = React.memo(() => {

    const [visible, setVisible] = useState<boolean>(false);

    useEffect(() => {
        const onDisplayStatusChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.LoadingIndicatorActiveChange)
            .subscribe(setVisible);

        return () => onDisplayStatusChangeSubscription.unsubscribe();
    }, []);

    return <LoadingIndicator visible={visible} />;

});
