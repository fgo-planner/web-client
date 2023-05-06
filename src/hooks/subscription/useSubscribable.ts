import { useMemo } from 'react';
import { Subject } from 'rxjs';
import { SubscribablesContainer } from '../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopic } from '../../utils/subscription/SubscriptionTopic';

export function useSubscribable<T = any>(topicName: string): Subject<T>;
export function useSubscribable<T>(topic: SubscriptionTopic<T>): Subject<T>;
export function useSubscribable<T = any>(param: SubscriptionTopic<T> | string): Subject<T> {
    const subscribable = useMemo(() => SubscribablesContainer.get<T>(param as any), [param]);
    if (!subscribable) {
        const description = getDescriptionString(param);
        throw new Error(`Could not find subscribable ${description}`);
    }
    return subscribable;
}

function getDescriptionString<T = any>(param: SubscriptionTopic<T> | string): string {
    if (typeof param === 'string') {
        return `topicName=${param}`;
    } else {
        return String(param);
    }
}
