import { GameItem } from '@fgo-planner/types';
import React, { Fragment } from 'react';
import { GameItemThumbnail } from '../../../../components/game/item/game-item-thumbnail.component';
import { Immutable } from '../../../../types/internal';

type Props = {
    editMode?: boolean;
    gameItem: Immutable<GameItem>;
};

export const StyleClassPrefix = 'MasterServantCostumesListRow';

export const MasterItemListRowLabel = React.memo(({ editMode, gameItem }: Props) => (
    <Fragment>
        <GameItemThumbnail
            gameItem={gameItem}
            size={42}
            showBackground
            enableLink={!editMode}
        />
        <div className={`${StyleClassPrefix}-item-name`}>
            {gameItem.name}
        </div>
    </Fragment>
));
