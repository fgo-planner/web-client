import { Nullable } from '@fgo-planner/common-types';
import { useEffect, useState } from 'react';
import { GameSoundtrackService } from '../../services/data/game/game-soundtrack.service';
import { GameSoundtrackList } from '../../types/data';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Returns cached soundtracks list from the `GameSoundtrackService`.
 * 
 * If the data is not yet available, then null/undefined is returned.
 */
export const useGameSoundtrackList = (): Nullable<GameSoundtrackList> => {

    const gameSoundtrackService = useInjectable(GameSoundtrackService);

    /*
     * Initialize the state with the game soundtracks list. If the data is not yet
     * available, then it is initialized as null/undefined and then retrieved later.
     */
    const [gameSoundtrackList, setGameSoundtrackList] =
        useState<Nullable<GameSoundtrackList>>(() => gameSoundtrackService.getSoundtracksSync());

    /*
     * Retrieve game soundtracks list if it wasn't available during initialization.
     */
    useEffect(() => {
        if (!gameSoundtrackList) {
            gameSoundtrackService.getSoundtracks().then(setGameSoundtrackList);
        }
    }, [gameSoundtrackList, gameSoundtrackService]);

    return gameSoundtrackList;

};
