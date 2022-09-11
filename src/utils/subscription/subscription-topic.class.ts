import { Supplier } from '@fgo-planner/common-core';

export class SubscriptionTopic<T = any> {

    /**
     * Whether the subject retains the last emitted value, which is replayed to an
     * observer upon subscription.
     */
    readonly retainLastValue: boolean;

    /**
     * A function that supplies the initial value of the subject.
     */
    readonly initialValueSupplier?: Supplier<T>;

    private constructor(retainLastValue: boolean, initialValueSupplier?: Supplier<T>) {
        this.retainLastValue = retainLastValue;
        this.initialValueSupplier = initialValueSupplier;
    }

    /**
     * Instantiates a `SubscriptionTopic` that doesn't retain any previous values.
     * Subscriptions are made through a `Subject`.
     */
    static forSubject<T = any>(): SubscriptionTopic<T> {
        return new SubscriptionTopic<T>(false);
    }

    /**
     * Instantiates a `SubscriptionTopic` that retains the last emitted value.
     * Subscriptions are made through a `ReplaySubject` set to buffer size of `1`.
     */
    static forReplaySubject<T = any>(): SubscriptionTopic<T> {
        return new SubscriptionTopic<T>(true);
    }

    /**
     * Instantiates a `SubscriptionTopic` that retains the last emitted value, and
     * is also initialized with a default value. Subscriptions are made through a
     * `BehaviorSubject`.
     */
    static forBehaviorSubject<T = any>(initialValueSupplier: Supplier<T>): SubscriptionTopic<T> {
        return new SubscriptionTopic<T>(true, initialValueSupplier);
    }

};
