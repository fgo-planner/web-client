import { useEffect, useState } from 'react';
import { GameServantList, GameServantService } from '../../services/data/game/game-servant.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

export const useGameServantList = (): GameServantList | undefined => {

    const gameServantService = useInjectable(GameServantService);

    const [gameServantList, setGameServantList] = useState<GameServantList>();

    useEffect(() => {
        gameServantService.getServants().then(setGameServantList);
    }, [gameServantService]);

    return gameServantList;

};
