import { Nullable } from '@fgo-planner/common-core';
import { useEffect, useState } from 'react';
import { GameItemService } from '../../services/data/game/game-item.service';
import { GameItemCategoryMap } from '../../types';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Returns a map of the loaded game item data from the `GameItemService` where
 * the key is the item ID, and the value is a readonly instance of the
 * corresponding `GameItem` object.
 * 
 * If the data is not yet available, then null/undefined is returned.
 */
export const useGameItemCategoryMap = (): Nullable<GameItemCategoryMap> => {

    const gameItemService = useInjectable(GameItemService);

    /**
     * Initialize the state with the game item map data. If the data is not yet
     * available, then it is initialized as null/undefined and then retrieved later.
     */
    const [gameItemCategoryMap, setGameItemCategoryMap] =
        useState<Nullable<GameItemCategoryMap>>(() => gameItemService.getItemCategoryMapSync());

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
