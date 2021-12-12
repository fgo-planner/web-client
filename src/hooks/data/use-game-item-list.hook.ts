import { useEffect, useState } from 'react';
import { GameItemList, GameItemService } from '../../services/data/game/game-item.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

export const useGameItemList = (): GameItemList | undefined => {

    const gameItemService = useInjectable(GameItemService);

    const [gameItemList, setGameItemList] = useState<GameItemList>();

    useEffect(() => {
        gameItemService.getItems().then(setGameItemList);
    }, [gameItemService]);

    return gameItemList;

};
