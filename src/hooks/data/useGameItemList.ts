import { useEffect, useState } from 'react';
import { GameItemService } from '../../services/data/game/GameItemService';
import { GameItemList } from '../../types';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Returns a readonly array containing immutable instances of all game items.
 *
 * Data is fetched and returned asynchronously. Returns `undefined` if the data
 * is not yet available.
 */
export const useGameItemList = (): GameItemList | undefined => {

    const gameItemService = useInjectable(GameItemService);

    /**
     * Initialize the state with the game items. If the data is not yet available,
     * then it is initialized as `undefined` and then retrieved later.
     */
    const [gameItemList, setGameItemList] = useState(() => gameItemService.getItemsSync());

    /**
     * Retrieve game items if it wasn't available during initialization.
     */
    useEffect(() => {
        if (!gameItemList) {
            gameItemService.getItems().then(setGameItemList);
        }
    }, [gameItemList, gameItemService]);

    return gameItemList;

};
