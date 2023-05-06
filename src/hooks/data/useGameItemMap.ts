import { useEffect, useState } from 'react';
import { GameItemService } from '../../services/data/game/GameItemService';
import { GameItemMap } from '../../utils/game/GameItemMap';
import { useInjectable } from '../dependency-injection/useInjectable';

/**
 * Returns a readonly map of game items, where the key is the item ID and the
 * value is an immutable instance of the item.
 *
 * Data is fetched and returned asynchronously. Returns `undefined` if the data
 * is not yet available.
 */
export const useGameItemMap = (): GameItemMap | undefined => {

    const gameItemService = useInjectable(GameItemService);

    /**
     * Initialize the state with the game item map data. If the data is not yet
     * available, then it is initialized as `undefined` and then retrieved later.
     */
    const [gameItemMap, setGameItemMap] = useState(() => gameItemService.getItemsMapSync());

    /**
     * Retrieve game item map if it wasn't available during initialization.
     */
    useEffect(() => {
        if (!gameItemMap) {
            gameItemService.getItemsMap().then(setGameItemMap);
        }
    }, [gameItemMap, gameItemService]);

    return gameItemMap;

};
