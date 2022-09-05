import { Immutable } from '@fgo-planner/common-types';
import { MasterAccount } from '@fgo-planner/data-types';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, useMemo } from 'react';
import { PlanRequirements } from '../../../../types/data';
import { DataTableGridCell } from '../../../data-table-grid/data-table-grid-cell.component';
import { DataTableGridRow } from '../../../data-table-grid/data-table-grid-row.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';

type Props = {
    masterAccount: Immutable<MasterAccount>;
    options: PlanRequirementsTableOptionsInternal;
    planRequirements: PlanRequirements;
};

const StyleClassPrefix = 'PlanRequirementsTableFooter';

const StyleProps = (theme: SystemTheme) => {

    const {
        palette,
        spacing
    } = theme as Theme;

    return {
        position: 'sticky',
        bottom: 0,
        zIndex: 3,
        [`& .${StyleClassPrefix}-sticky-content`]: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 320,
            height: '100%',
            fontWeight: 500,
            background: palette.background.paper
        },
        [`& .${StyleClassPrefix}-cell`]: {
            background: palette.background.paper,
            fontSize: '1rem'
        }
    } as SystemStyleObject<SystemTheme>;
};

export const PlanRequirementsTableFooter = React.memo((props: Props) => {

    const {
        masterAccount,
        options,
        planRequirements
    } = props;

    const inventoryQuantityMap = useMemo((): Record<number, number> => {
        const result: Record<number, number> = {};
        for (const { itemId, quantity } of masterAccount.resources.items) {
            result[itemId] = quantity;
        }
        return result;
    }, [masterAccount]);

    //#region Required quantity row

    const requiredStickyContent: ReactNode = (
        <div className={`${StyleClassPrefix}-sticky-content`}>
            Required
        </div>
    );

    const renderRequiredItemCell = (itemId: number): ReactNode => {
        const itemRequirements = planRequirements.group.items[itemId];
        return (
            <DataTableGridCell
                key={itemId}
                className={`${StyleClassPrefix}-cell`}
                size={options.cellSize}
                bold
            >
                {itemRequirements?.total}
            </DataTableGridCell>
        );
    };

    const requiredRow = (
        <DataTableGridRow
            borderTop
            stickyContent={requiredStickyContent}
        >
            {options.displayedItems.map(renderRequiredItemCell)}
        </DataTableGridRow>
    );

    //#endregion


    //#region Inventory quantity row

    const inventoryStickyContent: ReactNode = (
        <div className={`${StyleClassPrefix}-sticky-content`}>
            Inventory
        </div>
    );

    const renderInventoryItemCell = (itemId: number): ReactNode => {
        const quantity = inventoryQuantityMap[itemId] || 0;
        return (
            <DataTableGridCell
                key={itemId}
                className={`${StyleClassPrefix}-cell`}
                size={options.cellSize}
                bold
            >
                {quantity}
            </DataTableGridCell>
        );
    };

    const inventoryRow = (
        <DataTableGridRow
            borderTop
            stickyContent={inventoryStickyContent}
        >
            {options.displayedItems.map(renderInventoryItemCell)}
        </DataTableGridRow>
    );

    //#endregion


    //#region Deficit quantity row

    const deficitStickyContent: ReactNode = (
        <div className={`${StyleClassPrefix}-sticky-content`}>
            Deficit
        </div>
    );

    const renderDeficitItemCell = (itemId: number): ReactNode => {
        const quantity = inventoryQuantityMap[itemId] || 0;
        const required = planRequirements.group.items[itemId]?.total || 0;
        const deficit = Math.max(required - quantity, 0);
        return (
            <DataTableGridCell
                key={itemId}
                className={`${StyleClassPrefix}-cell`}
                size={options.cellSize}
                bold
            >
                {deficit || ''}
            </DataTableGridCell>
        );
    };

    const deficitRow = (
        <DataTableGridRow
            borderTop
            borderBottom
            stickyContent={deficitStickyContent}
        >
            {options.displayedItems.map(renderDeficitItemCell)}
        </DataTableGridRow>
    );

    //#endregion


    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {requiredRow}
            {inventoryRow}
            {deficitRow}
        </Box>
    );

    //#endregion

});
