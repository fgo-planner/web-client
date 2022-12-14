import React, { ReactNode } from 'react';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { DataTableGridRow } from '../../../data-table-grid/data-table-grid-row.component';
import { PlanRequirementsTableHeaderCell } from './PlanRequirementsTableHeaderCell';
import { PlanRequirementsTableOptionsInternal } from './PlanRequirementsTableOptionsInternal.type';

type Props = {
    activeItemId?: number;
    hoverItemId: number | undefined;
    options: PlanRequirementsTableOptionsInternal;
    onHover: (index?: number, itemId?: number) => void;
};

export const StyleClassPrefix = 'PlanRequirementsTableHeader';

export const PlanRequirementsTableHeader = React.memo((props: Props) => {

    const gameItemMap = useGameItemMap();

    const {
        activeItemId,
        hoverItemId,
        options: {
            displayedItems
        },
        onHover
    } = props;

    if (!gameItemMap) {
        return null;
    }

    const stickyContent: ReactNode = (
        <div className={`${StyleClassPrefix}-sticky-content`} />
    );

    const renderItemCell = (itemId: number): ReactNode => {
        const gameItem = gameItemMap[itemId];
        return (
            <PlanRequirementsTableHeaderCell
                key={itemId}
                active={itemId === activeItemId}
                gameItem={gameItem}
                hover={itemId === hoverItemId}
                onHover={onHover}
            />
        );
    };

    return (
        <DataTableGridRow
            className={`${StyleClassPrefix}-root`}
            borderBottom
            stickyContent={stickyContent}
        >
            {displayedItems.map(renderItemCell)}
        </DataTableGridRow>
    );

});
