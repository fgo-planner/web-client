import { useMemo } from 'react';
import { Subject } from 'rxjs';
import { SubscribablesContainer } from '../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopic } from '../../utils/subscription/SubscriptionTopic';

export function useSubscribable<T = any>(topicName: string): Subject<T>;
export function useSubscribable<T>(topic: SubscriptionTopic<T>): Subject<T>;
export function useSubscribable<T = any>(param: SubscriptionTopic<T> | string): Subject<T> {
    const subscribable = useMemo(() => SubscribablesContainer.get<T>(param as any), [param]);
    if (!subscribable) {
        throw new Error(/* TODO Add error message */);
    }
    return subscribable;
}
