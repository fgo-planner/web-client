import clsx from 'clsx';
import React, { MouseEvent, useCallback } from 'react';
import { DataTableGridCell } from '../../../data-table-grid/data-table-grid-cell.component';
import { PlanRequirementsTableUtils } from './PlanRequirementsTableUtils';

type Props = {
    active?: boolean;
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
        displayZeroValues,
        hover,
        itemId,
        quantity,
        onHover
    } = props;

    const handleMouseEnter = useCallback((_event: MouseEvent): void => {
        onHover?.(undefined, itemId);
    }, [itemId, onHover]);

    const {
        title,
        value
    } = PlanRequirementsTableUtils.formatCellValue(quantity, displayZeroValues ? '0' : undefined);

    const className = clsx(
        `${StyleClassPrefix}-root`,
        active && `${StyleClassPrefix}-active`,
        hover && `${StyleClassPrefix}-hover`
    );

    return (
        <DataTableGridCell
            className={className}
            onMouseEnter={handleMouseEnter}
        >
            {value && <span title={title}>{value}</span>}
        </DataTableGridCell>
    );

});
