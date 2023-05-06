import { GameServant } from '@fgo-planner/data-core';
import { GameEntityMap } from './GameEntityMap';

export class GameServantMap extends GameEntityMap<GameServant> {

    protected _getEntityName(): string {
        return 'GameServant';
    }

}
