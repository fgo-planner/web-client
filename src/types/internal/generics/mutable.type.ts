/**
 * Indicates that the type is mutable. Any properties (including nested
 * properties) will be striped of readonly modifiers.
 */
export type Mutable<T> = {
    -readonly [K in keyof T]: Mutable<T[K]>;
};
