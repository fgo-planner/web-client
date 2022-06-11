/**
 * Represents a supplier of results.
 */
export type Function<T, R> = (arg1 : T) => R;

/**
 * Represents a supplier of results.
 */
export type Supplier<T> = () => T;
