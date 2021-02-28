import { ReadonlyRecord } from './readonly-record.type';

export type CacheMap<K extends keyof any, V> = ReadonlyRecord<K, Readonly<V>>;
