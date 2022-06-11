/**
 * Strips any readonly modifiers on the root level fields. Does not modify
 * nested fields. For nested fields, use `Mutable<T>` instead.
 */
export type Writable<T> = {
    -readonly [K in keyof T]: T[K];
};
