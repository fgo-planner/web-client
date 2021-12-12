import { BehaviorSubject } from 'rxjs';
import { SubscriptionTopic } from './subscription-topic.class';

export class SubscribablesContainer {

    private static readonly _Observables = new Map<SubscriptionTopic, BehaviorSubject<any>>();

    static get<T>(topic: SubscriptionTopic<T>): BehaviorSubject<T> {
        let observable = this._Observables.get(topic);
        if (!observable) {
            this._Observables.set(topic, observable = new BehaviorSubject<T>(topic.initialValue));
        }
        return observable;
    }

}
