import { useEffect, useState } from 'react';
import { GameSoundtrackService } from '../../services/data/game/GameSoundtrackService';
import { GameSoundtrackList } from '../../types';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Returns a readonly array containing immutable instances of all soundtracks.
 *
 * Data is fetched and returned asynchronously. Returns `undefined` if the data
 * is not yet available.
 */
export const useGameSoundtrackList = (): GameSoundtrackList | undefined => {

    const gameSoundtrackService = useInjectable(GameSoundtrackService);

    /**
     * Initialize the state with the soundtracks. If the data is not yet available,
     * then it is initialized as `undefined` and then retrieved later.
     */
    const [gameSoundtrackList, setGameSoundtrackList] = useState(() => gameSoundtrackService.getSoundtracksSync());

    /**
     * Retrieve soundtracks if it wasn't available during initialization.
     */
    useEffect(() => {
        if (!gameSoundtrackList) {
            gameSoundtrackService.getSoundtracks().then(setGameSoundtrackList);
        }
    }, [gameSoundtrackList, gameSoundtrackService]);

    return gameSoundtrackList;

};
