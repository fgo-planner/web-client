import { GameItem } from '@fgo-planner/types';
import React, { Fragment } from 'react';
import { GameItemThumbnail } from '../../../../components/game/item/game-item-thumbnail.component';

type Props = {
    item: GameItem;
    editMode?: boolean;
};

export const StyleClassPrefix = 'MasterServantCostumesListRow';

export const MasterItemListRowLabel = React.memo(({ item, editMode }: Props) => (
    <Fragment>
        <GameItemThumbnail
            item={item}
            size={42}
            showBackground
            enableLink={!editMode}
        />
        <div className={`${StyleClassPrefix}-item-name`}>
            {item.name}
        </div>
    </Fragment>
));
