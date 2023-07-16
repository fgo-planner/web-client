// TODO Move this to common-core
export function asSync<T extends unknown[]>(func: (...args: T) => Promise<void>): (...args: T) => void {
    return (...args: T): void => {
        return void func(...args);
    };
}
