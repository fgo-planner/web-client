import { useEffect, useState } from 'react';
import { GameItemMap, GameItemService } from '../../services/data/game/game-item.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Returns a map of the loaded game item data from the `GameItemService` where
 * the key is the item ID, and the value is a readonly instance of the
 * corresponding `GameItem` object.
 */
export const useGameItemMap = (): GameItemMap | undefined => {

    const gameItemService = useInjectable(GameItemService);

    const [gameItemMap, setGameItemMap] = useState<GameItemMap>();

    /*
     * Retrieve game item map.
     */
    useEffect(() => {
        gameItemService.getItemsMap().then(setGameItemMap);
    }, [gameItemService]);

    return gameItemMap;

};
