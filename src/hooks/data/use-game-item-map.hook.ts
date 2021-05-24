import { useEffect, useState } from 'react';
import { GameItemMap, GameItemService } from '../../services/data/game/game-item.service';

/**
 * Returns a map of the loaded game item data from the `GameItemService` where
 * the key is the item ID, and the value is a readonly instance of the
 * corresponding `GameItem` object.
 */
export const useGameItemMap = (): GameItemMap | undefined => {

    const [gameItemMap, setGameItemMap] = useState<GameItemMap>();

    /*
     * Retrieve game item map.
     */
    useEffect(() => {
        GameItemService.getItemsMap().then(setGameItemMap);
    }, []);

    return gameItemMap;

};
