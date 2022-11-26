import clsx from 'clsx';
import React, { MouseEvent, useCallback } from 'react';
import { DataTableGridCell } from '../../../data-table-grid/data-table-grid-cell.component';

type Props = {
    active?: boolean;
    cellSize: number;
    displayZeroValues: boolean;
    hover?: boolean;
    itemId: number;
    quantity: number | undefined;
    onHover?: (index?: number, itemId?: number) => void;
};

export const StyleClassPrefix = 'PlanRequirementsTableFooterCell';

export const PlanRequirementsTableFooterCell = React.memo((props: Props) => {

    const {
        active,
        cellSize,
        displayZeroValues,
        hover,
        itemId,
        quantity,
        onHover
    } = props;

    const handleMouseEnter = useCallback((_event: MouseEvent): void => {
        onHover?.(undefined, itemId);
    }, [itemId, onHover]);

    let value: number | undefined;
    if (quantity) {
        value = quantity;
    } else if (displayZeroValues) {
        value = 0;
    }

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
            {value}
        </DataTableGridCell>
    );

});
