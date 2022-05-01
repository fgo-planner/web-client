import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { SubscriptionTopic } from './subscription-topic.class';

export class SubscribablesContainer {

    private static readonly _Observables = new Map<SubscriptionTopic, Subject<any>>();

    private constructor () {
        
    }

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
            observable = this._instantiateSubject(topic);
            this._Observables.set(topic, observable);
        }
        return observable;
    }

    private static _instantiateSubject<T>(topic: SubscriptionTopic<T>): Subject<T> {
        if (topic.initialValueSupplier) {
            const initialValue = topic.initialValueSupplier.apply(this);
            return new BehaviorSubject(initialValue);
        }
        if (topic.retainLastValue) {
            /**
             * The `ReplaySubject` is instantiated with a buffer size of `1` so that only
             * the very last value is replayed, similar to a `BehaviorSubject`.
             */
            return new ReplaySubject(1);
        }
        return new Subject();
    }

}
