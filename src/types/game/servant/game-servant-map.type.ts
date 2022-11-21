import { ImmutableRecord } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';

/**
 * TODO Use a Map for this instead of an object.
 */
export type GameServantMap = ImmutableRecord<number, GameServant>;
