import { useEffect, useState } from 'react';
import { GameItemList, GameItemService } from '../../services/data/game/game-item.service';

export const useGameItemList = (): GameItemList | undefined => {

    const [gameItemList, setGameItemList] = useState<GameItemList>();

    useEffect(() => {
        GameItemService.getItems().then(setGameItemList);
    }, []);

    return gameItemList;

};
