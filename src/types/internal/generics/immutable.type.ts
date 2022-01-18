/**
 * Indicates that the type is immutable. Any properties (including nested
 * properties) will be readonly.
 */
export type Immutable<T> = {
    readonly [K in keyof T]: Immutable<T[K]>;
};
