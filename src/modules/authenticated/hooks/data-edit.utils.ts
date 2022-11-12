import { SetStateAction } from 'react';

type AnyServant = Readonly<{
    instanceId: number
}>;

/**
 * Contains common utility functions for data edit hooks.
 */
export class DataEditUtils {

    static getUpdatedValue<T extends number | string | object>(action: SetStateAction<T>, previousValue: T): T {
        if (typeof action === 'function') {
            return action(previousValue);
        }
        return action;
    };

    static isServantsOrderChanged(
        reference: ReadonlyMap<number, AnyServant>,
        servants: Array<AnyServant>
    ): boolean {
        if (reference.size !== servants.length) {
            return true;
        }
        let index = 0;
        for (const referenceInstanceId of reference.keys()) {
            if (referenceInstanceId !== servants[index++].instanceId) {
                return true;
            }
        }
        return false;
    };

}
