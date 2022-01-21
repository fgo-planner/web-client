import { useEffect, useState } from 'react';
import { GameItemService } from '../../services/data/game/game-item.service';
import { GameItemList, Nullable } from '../../types/internal';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Returns cached items list from the `GameItemService`.
 * 
 * If the data is not yet available, then null/undefined is returned.
 */
export const useGameItemList = (): Nullable<GameItemList> => {

    const gameItemService = useInjectable(GameItemService);

    /*
     * Initialize the state with the game items list. If the data is not yet
     * available, then it is initialized as null/undefined and then retrieved later.
     */
    const [gameItemList, setGameItemList] = useState<Nullable<GameItemList>>(() => gameItemService.getItemsSync());

    /*
     * Retrieve game items list if it wasn't available during initialization.
     */
    useEffect(() => {
        if (!gameItemList) {
            gameItemService.getItems().then(setGameItemList);
        }
    }, [gameItemList, gameItemService]);

    return gameItemList;

};
