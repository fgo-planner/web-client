import { Entity } from '../../entity.type';

export type GameSoundtrack = Entity<number> & {

    name?: string;

    /**
     * Material required to unlock the soundtrack. This should be `undefined` for
     * tracks that are already unlocked by default.
     */
    material?: {

        itemId: number;

        quantity: number;

    };

    audioUrl?: string;

    thumbnailUrl?: string;

};
