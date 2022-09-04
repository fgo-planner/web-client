import { GameItem } from '@fgo-planner/data-types';
import React from 'react';
import { GameItemThumbnail } from '../../../../components/game/item/game-item-thumbnail.component';
import { Immutable } from '../../../../types/internal';

type Props = {
    gameItem: Immutable<GameItem>;
};

export const StyleClassPrefix = 'MasterServantCostumesListRow';

export const MasterItemListRowLabel = React.memo(({ gameItem }: Props) => (
    <>
        <GameItemThumbnail
            gameItem={gameItem}
            size={52}
            showBackground
            enableLink
            openLinkInNewTab
        />
        <div className={`${StyleClassPrefix}-item-name`}>
            {gameItem.name}
        </div>
    </>
));
