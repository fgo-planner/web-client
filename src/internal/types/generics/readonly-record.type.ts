/**
 * Read-only extension of TypeScript's `Record` utility type.
 */
export type ReadonlyRecord<K extends keyof any, V> = Readonly<Record<K, V>>;