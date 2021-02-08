export class ArrayUtils {

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
