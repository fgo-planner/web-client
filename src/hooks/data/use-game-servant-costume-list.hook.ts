import { ImmutableArray, Nullable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { useMemo } from 'react';
import { GameServantCostumeList, GameServantCostumeListData } from '../../types/data';

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
    result.sort((a, b) => a.costume.collectionNo - b.costume.collectionNo);
    return result;
};

export const useGameServantCostumeList = (gameServants: Nullable<ImmutableArray<GameServant>>): GameServantCostumeList => {
    return useMemo((): GameServantCostumeList => {
        if (!gameServants) {
            return [];
        }
        return transformCostumesList(gameServants);
    }, [gameServants]);
};
