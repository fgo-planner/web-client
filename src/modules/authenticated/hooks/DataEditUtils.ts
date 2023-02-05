import { InstantiatedServant } from '@fgo-planner/data-core';
import { SetStateAction } from 'react';

/**
 * Contains common utility functions for data edit hooks.
 */
export namespace DataEditUtils {

    export function getUpdatedValue<T extends number | string | object>(action: SetStateAction<T>, previousValue: T): T {
        if (typeof action === 'function') {
            return action(previousValue);
        }
        return action;
    };

    export function isServantsOrderChanged(
        reference: ReadonlyMap<number, InstantiatedServant>,
        servants: Array<InstantiatedServant>
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
