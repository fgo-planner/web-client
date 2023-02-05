import { useEffect, useState } from 'react';
import { GameServantService } from '../../services/data/game/GameServantService';
import { GameServantMap } from '../../types';
import { useInjectable } from '../dependency-injection/useInjectable';

/**
 * Returns a readonly map of game servants, where the key is the servant ID and
 * the value is an immutable instance of the servant.
 *
 * Data is fetched and returned asynchronously. Returns `undefined` if the data
 * is not yet available.
 */
export const useGameServantMap = (): GameServantMap | undefined => {

    const gameServantService = useInjectable(GameServantService);

    /**
     * Initialize the state with the game servant map data. If the data is not yet
     * available, then it is initialized as `undefined` and then retrieved later.
     */
    const [gameServantMap, setGameServantMap] = useState(() => gameServantService.getServantsMapSync());

    /**
     * Retrieve game servant map if it wasn't available during initialization.
     */
    useEffect(() => {
        if (!gameServantMap) {
            gameServantService.getServantsMap().then(setGameServantMap);
        }
    }, [gameServantMap, gameServantService]);

    return gameServantMap;

};
