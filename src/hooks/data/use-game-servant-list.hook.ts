import { useEffect, useState } from 'react';
import { GameServantList, GameServantService } from '../../services/data/game/game-servant.service';

export const useGameServantList = (): GameServantList | undefined => {

    const [gameServantList, setGameServantList] = useState<GameServantList>();

    useEffect(() => {
        GameServantService.getServants().then(setGameServantList);
    }, []);

    return gameServantList;

};
