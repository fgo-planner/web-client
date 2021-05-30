export class ObjectUtils {

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
