import { CollectionUtils, Immutable, ImmutableArray, Nullable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';
import { GameServantCostumeAggregatedData } from '../../types';

export type UseGameServantCostumeListResult = {
    alwaysUnlockedIds: ReadonlySet<number>;
    costumeList: ReadonlyArray<GameServantCostumeAggregatedData>;
};

type InputData = Immutable<GameServant> | ImmutableArray<GameServant>;

const isSingularGameServant = (data: InputData): data is Immutable<GameServant> => {
    return !Array.isArray(data);
};

const collectionNoComparator = (a: GameServantCostumeAggregatedData, b: GameServantCostumeAggregatedData): number => {
    return a.costume.collectionNo - b.costume.collectionNo;
};

const alwaysUnlockedFilter = (costume: GameServantCostumeAggregatedData): boolean => {
    return isEmpty(costume.costume.materials.materials);
};

const transformCostumesList = (gameServants: ImmutableArray<GameServant>): Array<GameServantCostumeAggregatedData> => {
    const result: Array<GameServantCostumeAggregatedData> = [];
    if (!gameServants.length) {
        return result;
    }
    for (const servant of gameServants) {
        const { costumes } = servant;
        for (const [id, costume] of Object.entries(costumes)) {
            result.push({
                costumeId: Number(id),
                servant,
                costume
            });
        }
    }
    result.sort(collectionNoComparator);
    return result;
};

export function useGameServantCostumeList(gameServant: Nullable<Immutable<GameServant>>): UseGameServantCostumeListResult;
export function useGameServantCostumeList(gameServants: Nullable<ImmutableArray<GameServant>>): UseGameServantCostumeListResult;
export function useGameServantCostumeList(data: Nullable<InputData>): UseGameServantCostumeListResult;
/**
 * Function implementation.
 */
export function useGameServantCostumeList(data: Nullable<InputData>): UseGameServantCostumeListResult {

    const costumeList = useMemo((): ReadonlyArray<GameServantCostumeAggregatedData> => {
        if (!data) {
            return CollectionUtils.emptyArray();
        }
        let gameServants: ImmutableArray<GameServant>;
        if (isSingularGameServant(data)) {
            gameServants = [data];
        } else {
            gameServants = data;
        }
        return transformCostumesList(gameServants);
    }, [data]);

    const alwaysUnlockedIds = useMemo((): ReadonlySet<number> => {
        if (!costumeList.length) {
            return CollectionUtils.emptySet();
        }
        const result = costumeList
            .filter(alwaysUnlockedFilter)
            .map(costume => costume.costumeId);
        return new Set(result);
    }, [costumeList]);

    return {
        alwaysUnlockedIds,
        costumeList,
    };

};
