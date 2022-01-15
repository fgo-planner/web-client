export class ObjectUtils {

    static getOrDefault<K extends string | number | symbol, V>(obj: Record<K, V>, key: K, defaultValue: V | (() => V)): V {
        let value = obj[key];
        if (value !== undefined) {
            return value;
        }
        if (typeof defaultValue === 'function') {
            const instantiate = defaultValue as (() => V);
            value = instantiate();
        } else {
            value = defaultValue;
        }
        return obj[key] = value;
    }

    static isShallowEquals(a: Record<string, any>, b: Record<string, any>): boolean {
        for (const key of Object.keys(a)) {
            if (!(key in b) || a[key] !== b[key]) {
                return false;
            }
        }
        for (const key of Object.keys(b)) {
            if (!(key in a) || a[key] !== b[key]) {
                return false;
            }
        }
        return true;
    }

}
