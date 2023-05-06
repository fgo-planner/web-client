import React, { ReactNode } from 'react';
import { useGameItemMap } from '../../../../hooks/data/useGameItemMap';
import { DataTableGridRow } from '../../../data-table-grid/DataTableGridRow';
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
        const gameItem = gameItemMap.get(itemId);
        if (!gameItem) {
            return null;
        }
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
