import { useEffect, useState } from 'react';
import { GameServantService } from '../../services/data/game/GameServantService';
import { GameServantList } from '../../types';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Returns a readonly array containing immutable instances of all game servants,
 * sorted by their `collectionNo` values.
 *
 * Data is fetched and returned asynchronously. Returns `undefined` if the data
 * is not yet available.
 */
export const useGameServantList = (): GameServantList | undefined => {

    const gameServantService = useInjectable(GameServantService);

    /**
     * Initialize the state with the game servants. If the data is not yet
     * available, then it is initialized as `undefined` and then retrieved later.
     */
    const [gameServantList, setGameServantList] = useState(() => gameServantService.getServantsSync());

    /**
     * Retrieve game servants if it wasn't available during initialization.
     */
    useEffect(() => {
        if (!gameServantList) {
            gameServantService.getServants().then(setGameServantList);
        }
    }, [gameServantList, gameServantService]);

    return gameServantList;

};
