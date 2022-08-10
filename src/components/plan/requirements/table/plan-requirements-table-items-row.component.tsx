import React, { ReactNode } from 'react';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { DataTableGridCell } from '../../../data-table-grid/data-table-grid-cell.component';
import { DataTableGridRow } from '../../../data-table-grid/data-table-grid-row.component';
import { GameItemThumbnail } from '../../../game/item/game-item-thumbnail.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';

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
            <DataTableGridCell key={itemId} size={options.cellSize}>
                <GameItemThumbnail
                    gameItem={gameItem}
                    size={options.cellSize}
                    showBackground
                />
            </DataTableGridCell>
        );
    };

    return (
        <DataTableGridRow
            borderTop={borderTop}
            borderBottom={borderBottom}
            stickyContent={<div style={{width: 320, backgroundColor: 'red', height: '100%'}}></div>}
        >
            {options.displayedItems.map(renderItemCell)}
        </DataTableGridRow>
    );

});
