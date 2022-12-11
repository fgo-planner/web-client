import clsx from 'clsx';
import React from 'react';
import { DataTableGridCell } from '../../../data-table-grid/data-table-grid-cell.component';
import { PlanRequirementsTableUtils } from './PlanRequirementsTableUtils';

type Props = {
    active?: boolean;
    hover: boolean;
    quantity?: number;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRowCell';

export const PlanRequirementsTableServantRowCell = React.memo((props: Props) => {

    const {
        active,
        hover,
        quantity
    } = props;

    const {
        title,
        value
    } = PlanRequirementsTableUtils.formatCellValue(quantity);

    const className = clsx(
        `${StyleClassPrefix}-root`,
        active && `${StyleClassPrefix}-active`,
        hover && `${StyleClassPrefix}-hover`
    );

    return (
        <DataTableGridCell className={className}>
            {value && <span title={title}>{value}</span>}
        </DataTableGridCell>
    );

});
