import React, { ReactNode } from 'react';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { GameItemThumbnail } from '../../../game/item/game-item-thumbnail.component';
import { PlanRequirementsTableCell } from './plan-requirements-table-cell.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';
import { PlanRequirementsTableRow } from './plan-requirements-table-row.component';

type Props = {
    borderBottom?: boolean;
    borderTop?: boolean;
    options: PlanRequirementsTableOptionsInternal;
};

export const PlanRequirementsTableItemsRow = React.memo((props: Props) => {

    const {
        borderBottom,
        borderTop,
        options
    } = props;

    const gameItemMap = useGameItemMap();

    if (!gameItemMap) {
        return null;
    }

    const renderItemCell = (itemId: number): ReactNode => {
        const gameItem = gameItemMap[itemId];
        return (
            <PlanRequirementsTableCell key={itemId} size={options.displaySize}>
                <GameItemThumbnail
                    gameItem={gameItem}
                    size={options.displaySize}
                    showBackground
                />
            </PlanRequirementsTableCell>
        );
    };

    return (
        <PlanRequirementsTableRow borderTop={borderTop} borderBottom={borderBottom}>
            <div style={{ width: 320 }}>
                {/* Empty */}
            </div>
            {options.displayedItems.map(renderItemCell)}
        </PlanRequirementsTableRow>
    );

});
