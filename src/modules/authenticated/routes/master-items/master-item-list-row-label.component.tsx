import { Immutable } from '@fgo-planner/common-core';
import { GameItem } from '@fgo-planner/data-core';
import React from 'react';
import { ItemThumbnail } from '../../../../components/item/ItemThumbnail';

type Props = {
    gameItem: Immutable<GameItem>;
};

export const StyleClassPrefix = 'MasterServantCostumesListRow';

export const MasterItemListRowLabel = React.memo(({ gameItem }: Props) => (
    <>
        <ItemThumbnail
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
