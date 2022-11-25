import React from 'react';
import { DataTableGridCell } from '../../../data-table-grid/data-table-grid-cell.component';
import { PlanRequirementsTableOptionsInternal } from './PlanRequirementsTableOptionsInternal.type';

type Props = {
    options: PlanRequirementsTableOptionsInternal;
    quantity?: number;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRowCell';

export const PlanRequirementsTableServantRowCell = React.memo((props: Props): JSX.Element => {

    const {
        options,
        quantity
    } = props;

    return (
        <DataTableGridCell
            className={`${StyleClassPrefix}-root`}
            size={options.cellSize}
        >
            {quantity}
        </DataTableGridCell>
    );

});
