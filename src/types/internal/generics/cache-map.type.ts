import { ReadonlyRecord } from './readonly-record.type';

/**
 * @deprecated Use `ImmutableRecord<K, V>` instead.
 */
export type CacheMap<K extends keyof any, V> = ReadonlyRecord<K, Readonly<V>>;
