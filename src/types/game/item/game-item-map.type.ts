import { ImmutableRecord } from '@fgo-planner/common-core';
import { GameItem } from '@fgo-planner/data-core';

/**
 * TODO Use a Map for this instead of an object.
 */
export type GameItemMap = ImmutableRecord<number, GameItem>;
