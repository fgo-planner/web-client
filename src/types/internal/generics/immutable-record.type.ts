import { Immutable, ReadonlyRecord } from '..';

/**
 * Readonly record of `Immutable` typed objects.
 */
export type ImmutableRecord<K extends keyof any, V> = ReadonlyRecord<K, Immutable<V>>;
