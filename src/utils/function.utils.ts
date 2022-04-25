import { Supplier } from '../types/internal';

/**
 * Supplies a `null` value.
 */
export const nullSupplier: Supplier<null> = () => null;

/**
 * Supplies an empty object (`{}`) value.
 */
export const emptyObjectSupplier: Supplier<{}> = () => ({});

/*
export class FunctionUtils {

}
*/
