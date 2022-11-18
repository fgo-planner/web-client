import { Immutable } from '@fgo-planner/common-core';
import { GameServant, GameServantCostume } from '@fgo-planner/data-core';

/**
 * DTO containing a costume and additional related data (costume number and
 * source `GameServant` object).
 */
export type GameServantCostumeListData = Immutable<{

    /**
     * Not the same as `collectionNo`.
     */
    costumeId: number;

    servant: GameServant;

    costume: GameServantCostume;

}>;

export type GameServantCostumeList = ReadonlyArray<GameServantCostumeListData>;
