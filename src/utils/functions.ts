import { Supplier } from '../types/internal';

export class Functions {

    private constructor() {

    }

    /**
     * Supplies a `null` value.
     */
    static nullSupplier: Supplier<null> = function () {
        return null;
    };

    /**
     * Supplies an empty object (`{}`) value.
     */
    static emptyObjectSupplier: Supplier<{}> = function () {
        return {};
    };

    /**
     * Toggles a truthy value to its opposite boolean value.
     */
    static toggleTruthy: (<T>(value: T) => boolean) = function <T>(value: T) {
        return !value;
    };

}
