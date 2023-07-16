import { Immutable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { useEffect, useState } from 'react';
import { GameServantService } from '../../services/data/game/GameServantService';
import { GameServantMap } from '../../utils/game/GameServantMap';
import { useInjectable } from '../dependency-injection/useInjectable';

type DataPromises = [
    Promise<GameServantMap>,
    Promise<ReadonlyMap<string, number>>
];

export function useFgoManagerNamesMap(): ReadonlyMap<string, Immutable<GameServant>> | undefined {

    const gameServantService = useInjectable(GameServantService);

    const [map, setMap] = useState<ReadonlyMap<string, Immutable<GameServant>>>();

    useEffect(() => {
        const dataPromises: DataPromises = [
            gameServantService.getServantsMap(),
            gameServantService.getFgoManagerNamesMap()
        ];
        Promise.all(dataPromises).then(resolvedData => {
            const [gameServantMap, fgoManagerNamesMap] = resolvedData;
            const map = new Map<string, Immutable<GameServant>>();
            for (const [fgoManagerName, servantId] of fgoManagerNamesMap.entries()) {
                const gameServant = gameServantMap.get(servantId);
                if (!gameServant) {
                    continue;
                }
                map.set(fgoManagerName, gameServant);
            }
            setMap(map);
        });
    }, [gameServantService]);

    return map;

}
