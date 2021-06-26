import { Entity } from '../../entity.type';
import { GameItemQuantity } from '../item/game-item-quantity.type';

export type GameSoundtrack = Entity<number> & {

    name?: string;

    priority: number;

    /**
     * Material required to unlock the soundtrack. This should be `undefined` for
     * tracks that are already unlocked by default.
     */
    material?: GameItemQuantity;

    audioUrl?: string;

    thumbnailUrl?: string;

};
