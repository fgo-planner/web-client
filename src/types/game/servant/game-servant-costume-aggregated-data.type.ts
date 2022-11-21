import { Immutable } from '@fgo-planner/common-core';
import { GameServant, GameServantCostume } from '@fgo-planner/data-core';

/**
 * DTO containing a `GameServantCostume` object, as well as the costume ID and
 * the source `GameServant` object.
 */
export type GameServantCostumeAggregatedData = Immutable<{

    /**
     * Not the same as `collectionNo`.
     */
    costumeId: number;

    servant: GameServant;

    costume: GameServantCostume;

}>;
