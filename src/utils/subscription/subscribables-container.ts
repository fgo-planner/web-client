import { BehaviorSubject, Subject } from 'rxjs';
import { SubscriptionTopic } from './subscription-topic';

export class SubscribablesContainer {

    private static readonly _Observables = new Map<SubscriptionTopic, Subject<any>>();

    /**
     * Returns a observable `Subject` for the given `SubscriptionTopic`. If the
     * `SubscriptionTopic` was defined with a default value initializer, then the
     * returned `Subject` will also be a `BehaviorSubject`. The value of the
     * `hasInitialValue` field in the `SubscriptionTopic` instance can be used to
     * determine whether the topic has a initial value.
     */
    static get<T>(topic: SubscriptionTopic<T>): Subject<T> {
        let observable = this._Observables.get(topic);
        if (!observable) {
            const initializer = topic.initializer;
            observable = initializer ? new BehaviorSubject(initializer()) : new Subject();
            this._Observables.set(topic, observable);
        }
        return observable;
    }

}
