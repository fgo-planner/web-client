import { ImmutableRecord } from '@fgo-planner/common-core';
import { useEffect, useState } from 'react';
import { GameServantService } from '../../services/data/game/game-servant.service';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Returns a map of servant search keywords, where the key is the servant's ID,
 * and the value is a string containing the keywords.
 *
 * Data is fetched and returned asynchronously. Returns `undefined` if the data
 * is not yet available.
 */
export function useGameServantKeywordsMap(): ImmutableRecord<number, string> | undefined {

    const gameServantService = useInjectable(GameServantService);

    /**
     * Initialize the state with the game servant map data. If the data is not yet
     * available, then it is initialized as `undefined` and then populated after
     * retrieval.
     */
    const [keywordsMap, setKeywordsMap] = useState(() => gameServantService.getServantKeywordsMapSync());

    /**
     * Retrieve game servant map if it wasn't available during initialization.
     */
    useEffect(() => {
        if (!keywordsMap) {
            gameServantService.getServantKeywordsMap().then(setKeywordsMap);
        }
    }, [gameServantService, keywordsMap]);

    return keywordsMap;

};
