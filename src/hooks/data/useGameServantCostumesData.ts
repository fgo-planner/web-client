import { CollectionUtils, ImmutableArray, Nullable } from '@fgo-planner/common-core';
import { GameServant, GameServantConstants, GameServantCostumeAggregatedData, MasterServantAggregatedData } from '@fgo-planner/data-core';
import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';
import { DataAggregationUtils } from '../../utils/DataAggregationUtils';

export type UseGameServantCostumeListResult = {
    alwaysUnlockedIds: ReadonlySet<number>;
    costumeList: ReadonlyArray<GameServantCostumeAggregatedData>;
};

type InputData = ImmutableArray<GameServant> | ReadonlyArray<MasterServantAggregatedData>;

const collectionNoComparator = (a: GameServantCostumeAggregatedData, b: GameServantCostumeAggregatedData): number => {
    return a.costume.collectionNo - b.costume.collectionNo;
};

const isDataAggregated = (data: InputData): data is ReadonlyArray<MasterServantAggregatedData> => {
    /**
     * At this point, `data` should contain at least one element.
     */
    return !!(data[0] as any).gameServant;
};

const transformCostumesList = (gameServants: ImmutableArray<GameServant>): Array<GameServantCostumeAggregatedData> => {
    const result: Array<GameServantCostumeAggregatedData> = [];
    /**
     * At this point, `gameServants` should contain at least one element.
     */
    for (const gameServant of gameServants) {
        const costumes = gameServant.costumes;
        for (const [key, costume] of Object.entries(costumes)) {
            const costumeId = Number(key);
            const alwaysUnlocked = isEmpty(costume.materials.materials);
            const noCostUnlockAvailable = GameServantConstants.NoCostCostumeOptions.has(costumeId);
            result.push({
                alwaysUnlocked,
                costume,
                costumeId,
                gameServant,
                noCostUnlockAvailable
            });
        }
    }
    result.sort(collectionNoComparator);
    return result;
};

export function useGameServantCostumesData(gameServants: Nullable<ReadonlyArray<MasterServantAggregatedData>>): ReadonlyArray<GameServantCostumeAggregatedData>;
export function useGameServantCostumesData(gameServants: Nullable<ImmutableArray<GameServant>>): ReadonlyArray<GameServantCostumeAggregatedData>;
export function useGameServantCostumesData(data: Nullable<InputData>): ReadonlyArray<GameServantCostumeAggregatedData>;
/**
 * Function implementation.
 */
export function useGameServantCostumesData(data: Nullable<InputData>): ReadonlyArray<GameServantCostumeAggregatedData> {

    return useMemo((): ReadonlyArray<GameServantCostumeAggregatedData> => {
        if (!data || !data.length) {
            return CollectionUtils.emptyArray();
        }
        let gameServants: ImmutableArray<GameServant>;
        if (isDataAggregated(data)) {
            gameServants = data.map(DataAggregationUtils.getGameServant);
        } else {
            gameServants = data;
        }
        return transformCostumesList(gameServants);
    }, [data]);

}
