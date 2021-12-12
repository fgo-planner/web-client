import { useMemo } from 'react';
import { BehaviorSubject } from 'rxjs';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../utils/subscription/subscription-topic.class';

export function useSubscribable<T = any>(topicName: string): BehaviorSubject<T>;
export function useSubscribable<T>(topic: SubscriptionTopic<T>): BehaviorSubject<T>;
export function useSubscribable<T = any>(param: SubscriptionTopic<T> | string): BehaviorSubject<T> {
    const subscribable = useMemo(() => SubscribablesContainer.get<T>(param as any), [param]);
    if (!subscribable) {
        throw new Error(/* TODO Add error message */);
    }
    return subscribable;
}
