export class SetUtils {

    static isEqual<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean {
        if (a.size !== b.size) {
            return false;
        }
        for (const elem of a) {
            if (!b.has(elem)) {
                return false;
            }
        }
        return true;
    }

}