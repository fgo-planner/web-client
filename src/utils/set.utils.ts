export class SetUtils {

    private static readonly _EmptySet = new Set<any>() as ReadonlySet<any>;

    private constructor () {
        
    }

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

    static emptySet<T>(): ReadonlySet<T> {
        return this._EmptySet;
    }

}