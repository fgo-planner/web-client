import { Immutable } from '@fgo-planner/common-core';
import { MasterCostumes } from '@fgo-planner/data-core';

export namespace MasterAccountUtils {

    /**
     * Generates a map for the unlocked costumes whether the ky is the costume ID
     * and the value is a boolean indicating whether the costume was unlocked for
     * free.
     */
    export function generateUnlockedCostumesMap(costumes: Immutable<MasterCostumes>): Record<number, boolean> {
        const result: Record<number, boolean> = {};
        for (const costumeId of costumes.unlocked) {
            result[costumeId] = costumes.noCostUnlock.includes(costumeId);
        }
        return result;
    }

    export function unlockedCostumesMapToIdSet(costumesMap: Record<number, boolean>): Set<number> {
        return new Set(Object.keys(costumesMap).map(Number));
    }

}
