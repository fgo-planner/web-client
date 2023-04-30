import { Immutable, ImmutableRecord, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { useEffect, useState } from 'react';
import { GameServantService } from '../../services/data/game/GameServantService';
import { useInjectable } from '../dependency-injection/useInjectable';

type DataPromises = [
    Promise<ReadonlyRecord<number, Immutable<GameServant>>>,
    Promise<ReadonlyRecord<string, number>>
];

export function useFgoManagerNamesMap(): ImmutableRecord<string, GameServant> | undefined {

    const gameServantService = useInjectable(GameServantService);

    const [map, setMap] = useState<ImmutableRecord<string, GameServant>>();

    useEffect(() => {
        const dataPromises: DataPromises = [
            gameServantService.getServantsMap(),
            gameServantService.getFgoManagerNamesMap()
        ];
        Promise.all(dataPromises).then(resolvedData => {
            const [gameServantsMap, fgoManagerNamesMap] = resolvedData;
            const map: Record<string, Immutable<GameServant>> = {};
            for (const [fgoManagerName, servantId] of Object.entries(fgoManagerNamesMap)) {
                const gameServant = gameServantsMap[servantId];
                if (!gameServant) {
                    continue;
                }
                map[fgoManagerName] = gameServant;
            }
            setMap(map);
        });
    }, [gameServantService]);

    return map;

};
