import { useEffect, useState } from 'react';
import { GameItemService } from '../../services/data/game/GameItemService';
import { GameItemCategoryMap } from '../../types';
import { useInjectable } from '../dependency-injection/useInjectable';

/**
 * Returns a readonly map of game item categories, where the key is the item
 * category and the value is a set of item IDs that belong to the category.
 *
 * Data is fetched and returned asynchronously. Returns `undefined` if the data
 * is not yet available.
 */
export const useGameItemCategoryMap = (): GameItemCategoryMap | undefined => {

    const gameItemService = useInjectable(GameItemService);

    /**
     * Initialize the state with the game item map data. If the data is not yet
     * available, then it is initialized as null/undefined and then retrieved later.
     */
    const [gameItemCategoryMap, setGameItemCategoryMap] = useState(() => gameItemService.getItemCategoryMapSync());

    /**
     * Retrieve game item category map if it wasn't available during initialization.
     */
    useEffect(() => {
        if (!gameItemCategoryMap) {
            gameItemService.getItemCategoryMap().then(setGameItemCategoryMap);
        }
    }, [gameItemCategoryMap, gameItemService]);

    return gameItemCategoryMap;

};
