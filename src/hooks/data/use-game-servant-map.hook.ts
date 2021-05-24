import { useEffect, useState } from 'react';
import { GameServantMap, GameServantService } from '../../services/data/game/game-servant.service';

/**
 * Returns a map of the loaded game servant data from the `GameServantService`
 * where the key is the servant ID, and the value is a readonly instance of
 * the corresponding `GameServant` object.
 */
export const useGameServantMap = (): GameServantMap | undefined => {

    const [gameServantMap, setGameServantMap] = useState<GameServantMap>();

    /*
     * Retrieve game servant map.
     */
    useEffect(() => {
        GameServantService.getServantsMap().then(setGameServantMap);
    }, []);

    return gameServantMap;

};
