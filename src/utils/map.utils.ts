export class MapUtils {

    static getOrDefault<K extends string | number | symbol, V>(map: Record<K, V>, key: K, defaultValue: V | (() => V)): V {
        let value = map[key];
        if (value !== undefined) {
            return value;
        }
        if (typeof defaultValue === 'function') {
            const instantiate = defaultValue as (() => V);
            value = instantiate();
        } else {
            value = defaultValue;
        }
        return map[key] = value;
    }

}
