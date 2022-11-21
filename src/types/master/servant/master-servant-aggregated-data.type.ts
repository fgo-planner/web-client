import { Immutable } from '@fgo-planner/common-core';
import { GameServant, ImmutableMasterServant, InstantiatedServant } from '@fgo-planner/data-core';

/**
 * DTO containing a `MasterServant` object, as well as the instance ID and the
 * source `GameServant` object.
 */
export type MasterServantAggregatedData = Readonly<InstantiatedServant & {

    masterServant: ImmutableMasterServant;

    gameServant: Immutable<GameServant>;

}>;
