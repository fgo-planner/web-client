import { Entity } from '../../entity.type';
import { GameItemBackground } from './game-item-background.enum';
import { GameItemType } from './game-item-type.enum';

/**
 * An inventory item.
 * 
 * Examples:
 * - Servant upgrade materials
 * - Event items and currencies
 * - Other consumable items
 */
export type GameItem = Entity<number> & {

    name?: string;

    nameJp?: string;

    background: GameItemBackground;

    type: GameItemType;

}
