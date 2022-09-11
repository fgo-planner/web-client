import { Nullable } from '@fgo-planner/common-core';
import { useEffect, useState } from 'react';
import { GameServantService } from '../../services/data/game/game-servant.service';
import { GameServantMap } from '../../types/data';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Returns a map of the cached servant data from the `GameServantService` where
 * the key is the servant ID, and the value is a readonly instance of the
 * corresponding `GameServant` object.
 *
 * If the data is not yet available, then null/undefined is returned.
 */
export const useGameServantMap = (): Nullable<GameServantMap> => {

    const gameServantService = useInjectable(GameServantService);

    /*
     * Initialize the state with the game servant map data. If the data is not yet
     * available, then it is initialized as null/undefined and then retrieved later.
     */
    const [gameServantMap, setGameServantMap] = useState<Nullable<GameServantMap>>(() => gameServantService.getServantsMapSync());

    /*
     * Retrieve game servant map if it wasn't available during initialization.
     */
    useEffect(() => {
        if (!gameServantMap) {
            gameServantService.getServantsMap().then(setGameServantMap);
        }
    }, [gameServantMap, gameServantService]);

    return gameServantMap;

};
