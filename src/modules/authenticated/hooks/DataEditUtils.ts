import { ReadonlyRecord } from '@fgo-planner/common-core';
import { InstantiatedServant, InstantiatedServantBondLevel, MasterServantAggregatedData } from '@fgo-planner/data-core';
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

    /**
     * Returns a new `Set` containing only the costume IDs of the servants that are
     * present in the `aggregatedServants` array.
     */
    export function filterCostumesSet(
        costumes: ReadonlySet<number>,
        aggregatedServants: ReadonlyArray<MasterServantAggregatedData>
    ): Set<number> {
        const result = new Set<number>();
        for (const { gameServant } of aggregatedServants) {
            for (const key of Object.keys(gameServant.costumes)) {
                const costumeId = Number(key);
                if (costumes.has(costumeId)) {
                    result.add(costumeId);
                }
            }
        }
        return result;
    };

    /**
     * Returns a new unlocked costumes map instance containing only the costume IDs
     * of the servants that are present in the `aggregatedServants` array. 
     */
    export function filterCostumesMap(
        costumes: ReadonlyRecord<number, boolean>,
        aggregatedServants: ReadonlyArray<MasterServantAggregatedData>
    ): Record<number, boolean> {
        const result: Record<number, boolean> = {};
        for (const { gameServant } of aggregatedServants) {
            for (const key of Object.keys(gameServant.costumes)) {
                const costumeId = Number(key);
                const noCostUnlock = costumes[costumeId];
                if (noCostUnlock !== undefined) {
                    result[costumeId] = noCostUnlock;
                }
            }
        }
        return result;
    };

    /**
     * Returns a new bond level map instance containing only the servant IDs of the
     * servants that are present in the `aggregatedServants` array. 
     */
    export function filterBondLevels(
        bondLevels: ReadonlyRecord<number, InstantiatedServantBondLevel>,
        aggregatedServants: ReadonlyArray<MasterServantAggregatedData>
    ): Record<number, InstantiatedServantBondLevel> {
        const result: Record<number, InstantiatedServantBondLevel> = {};
        for (const { gameServant } of aggregatedServants) {
            const servantId = gameServant._id;
            const bondLevel = bondLevels[servantId];
            if (bondLevel !== undefined) {
                result[servantId] = bondLevel;
            }
        }
        return result;
    };

}
