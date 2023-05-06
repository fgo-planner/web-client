import { GameItem } from '@fgo-planner/data-core';
import { GameEntityMap } from './GameEntityMap';

export class GameItemMap extends GameEntityMap<GameItem> {

    protected _getEntityName(): string {
        return 'GameItem';
    }

}
