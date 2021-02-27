import { Entity } from '../../entity.type';
import { GameItemBackground } from './game-item-background.enum';
import { GameItemUsage } from './game-item-usage.enum';

/**
 * An inventory item.
 * 
 * Examples:
 * - Servant upgrade materials
 * - Event items and currencies
 * - Other consumable items
 */
export type GameItem = Entity<number> & {

    name: string;

    nameJp?: string;

    description?: string;

    background: GameItemBackground;

    uses: GameItemUsage[];

};
