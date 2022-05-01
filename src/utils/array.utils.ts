export class ArrayUtils {

    private constructor () {
        
    }

    static mapArrayToObject<T, K extends string | number | symbol>(
        arr: ReadonlyArray<T>, 
        keyFunc: (elem: T) => K
    ): Record<K, T>;

    static mapArrayToObject<T, K extends string | number | symbol, V>(
        arr: ReadonlyArray<T>, 
        keyFunc: (elem: T) => K,
        valueFunc: (elem: T) => V
    ): Record<K, V>;

    static mapArrayToObject<T, K extends string | number | symbol, V>(
        arr: ReadonlyArray<T>, 
        keyFunc: (elem: T) => K,
        valueFunc?: (elem: T) => V
    ): Record<K, T | V> {
        const result = {} as Record<K, T | V>;
        for (const elem of arr) {
            const key = keyFunc(elem);
            if (valueFunc) {
                result[key] = valueFunc(elem);
            } else {
                result[key] = elem;
            }
        }
        return result;
    }

    /**
     * Swaps two elements of the given array at the given indexes. The original
     * array is modified in-place.
     * 
     * If the given indices are equal, no operations will be performed. If one or
     * more of the indexes are out of bounds, an error is thrown.
     */
    static swapElements(array: Array<any>, a: number, b: number) {
        if (a === b) {
            return;
        }
        ArrayUtils._checkBounds(array, a);
        ArrayUtils._checkBounds(array, b);

        [array[b], array[a]] = [array[a], array[b]];
    }

    /**
     * Moves an elements of the given array at the given index to the target index.
     * The original array is modified in-place.
     * 
     * If the given indices are equal, no operations will take place. If one or
     * more of the indexes are out of bounds, an error is thrown.
     */
    static moveElement(array: Array<any>, from: number, to: number) {
        if (from === to) {
            return;
        }
        ArrayUtils._checkBounds(array, from);
        ArrayUtils._checkBounds(array, to);

        const element = array.splice(from, 1)[0];
        array.splice(to, 0, element);
    }

    private static _checkBounds(array: Array<any>, index: number): void {
        if (index < 0 || index >= array.length) {
            throw new Error(`Index ${index} is out of bounds`);
        }
    }

}
