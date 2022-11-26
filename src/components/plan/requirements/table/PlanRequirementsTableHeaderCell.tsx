import { Immutable } from '@fgo-planner/common-core';
import { GameItem } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { MouseEvent, useCallback } from 'react';
import { DataTableGridCell } from '../../../data-table-grid/data-table-grid-cell.component';
import { GameItemThumbnail } from '../../../game/item/game-item-thumbnail.component';

type Props = {
    active?: boolean;
    cellSize: number;
    gameItem: Immutable<GameItem>;
    hover?: boolean;
    onHover?: (index?: number, itemId?: number) => void;
};

export const StyleClassPrefix = 'PlanRequirementsTableHeaderCell';

export const PlanRequirementsTableHeaderCell = React.memo((props: Props) => {

    const {
        active,
        cellSize,
        gameItem,
        hover,
        onHover
    } = props;

    const handleMouseEnter = useCallback((_event: MouseEvent): void => {
        onHover?.(undefined, gameItem._id);
    }, [gameItem._id, onHover]);

    const className = clsx(
        `${StyleClassPrefix}-root`,
        active && `${StyleClassPrefix}-active`,
        hover && `${StyleClassPrefix}-hover`
    );

    return (
        <DataTableGridCell
            className={className}
            size={cellSize}
            onMouseEnter={handleMouseEnter}
        >
            <GameItemThumbnail
                gameItem={gameItem}
                size={cellSize}
                showBackground
            />
        </DataTableGridCell>
    );

});
