import { ImmutableArray, Nullable, CollectionUtils } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';
import { GameServantCostumeList, GameServantCostumeListData } from '../../types/data';

export type UseGameServantCostumeListResult = {
    alwaysUnlockedIds: ReadonlySet<number>,
    costumeList: GameServantCostumeList
};

const collectionNoComparator = (a: GameServantCostumeListData, b: GameServantCostumeListData): number => {
    return a.costume.collectionNo - b.costume.collectionNo;
};

const alwaysUnlockedFilter = (costume: GameServantCostumeListData): boolean => {
    return isEmpty(costume.costume.materials.materials);
};

const transformCostumesList = (gameServants: ImmutableArray<GameServant>): Array<GameServantCostumeListData> => {
    const result: Array<GameServantCostumeListData> = [];
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

export const useGameServantCostumeList = (gameServants: Nullable<ImmutableArray<GameServant>>): UseGameServantCostumeListResult => {

    const costumeList = useMemo((): GameServantCostumeList => {
        if (!gameServants) {
            return [];
        }
        return transformCostumesList(gameServants);
    }, [gameServants]);

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
