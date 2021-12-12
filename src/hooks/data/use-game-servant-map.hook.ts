import { useEffect, useState } from 'react';
import { GameServantMap, GameServantService } from '../../services/data/game/game-servant.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Returns a map of the loaded game servant data from the `GameServantService`
 * where the key is the servant ID, and the value is a readonly instance of
 * the corresponding `GameServant` object.
 */
export const useGameServantMap = (): GameServantMap | undefined => {

    const gameServantService = useInjectable(GameServantService);

    const [gameServantMap, setGameServantMap] = useState<GameServantMap>();

    /*
     * Retrieve game servant map.
     */
    useEffect(() => {
        gameServantService.getServantsMap().then(setGameServantMap);
    }, [gameServantService]);

    return gameServantMap;

};
