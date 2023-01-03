import { GameItemConstants } from '@fgo-planner/data-core';
import { IconButton, Tooltip } from '@mui/material';
import React, { ReactNode } from 'react';
import { PlanRequirements } from '../../../../types';
import { DataTableGridRow } from '../../../data-table-grid/data-table-grid-row.component';
import { IconOutlined } from '../../../icons';
import { PlanRequirementsTableFooterCell } from './PlanRequirementsTableFooterCell';
import { PlanRequirementsTableOptionsInternal } from './PlanRequirementsTableOptionsInternal.type';

type Props = {
    activeItemId?: number;
    hoverItemId: number | undefined;
    options: PlanRequirementsTableOptionsInternal;
    planRequirements: PlanRequirements;
    onEditMasterItems?: () => void;
    onHover: (index?: number, itemId?: number) => void;
};

export const StyleClassPrefix = 'PlanRequirementsTableFooter';

export const PlanRequirementsTableFooter = React.memo((props: Props) => {

    const {
        activeItemId,
        hoverItemId,
        options: {
            displayZeroValues,
            displayedItems
        },
        planRequirements: {
            requirements,
            resources
        },
        onEditMasterItems,
        onHover
    } = props;


    //#region Required quantity row

    const requiredItems = requirements.group.items;

    const requiredStickyContent: ReactNode = (
        <div className={`${StyleClassPrefix}-sticky-content`}>
            <span>Required</span>
        </div>
    );

    const renderRequiredItemCell = (itemId: number): ReactNode => {
        let quantity: number | undefined;
        if (itemId === GameItemConstants.QpItemId) {
            quantity = requirements.group.qp;
        } else {
            quantity = requiredItems[itemId]?.total;
        }
        return (
            <PlanRequirementsTableFooterCell
                key={itemId}
                active={itemId === activeItemId}
                displayZeroValues={displayZeroValues}
                hover={itemId === hoverItemId}
                itemId={itemId}
                quantity={quantity}
                onHover={onHover}
            />
        );
    };

    const requiredRow = (
        <DataTableGridRow
            borderTop
            stickyContent={requiredStickyContent}
        >
            {displayedItems.map(renderRequiredItemCell)}
        </DataTableGridRow>
    );

    //#endregion


    //#region Inventory quantity row

    const currentItems = resources.current.items;

    const inventoryStickyContent: ReactNode = (
        <div className={`${StyleClassPrefix}-sticky-content`}>
            {onEditMasterItems &&
                <Tooltip title='Edit inventory' placement='left'>
                    <IconButton
                        // color='info'
                        onClick={onEditMasterItems}
                        children={<IconOutlined>mode_edit</IconOutlined>}
                        size='small'
                    />
                </Tooltip>
            }
            <span>Inventory</span>
        </div>
    );

    const renderInventoryItemCell = (itemId: number): ReactNode => {
        let quantity: number;
        if (itemId === GameItemConstants.QpItemId) {
            quantity = resources.current.qp;
        } else {
            quantity = currentItems[itemId] || 0;
        }
        return (
            <PlanRequirementsTableFooterCell
                key={itemId}
                active={itemId === activeItemId}
                displayZeroValues
                hover={itemId === hoverItemId}
                itemId={itemId}
                quantity={quantity}
                onHover={onHover}
            />
        );
    };

    const inventoryRow = (
        <DataTableGridRow
            borderTop
            stickyContent={inventoryStickyContent}
        >
            {displayedItems.map(renderInventoryItemCell)}
        </DataTableGridRow>
    );

    //#endregion


    //#region Deficit quantity row

    const deficitItems = resources.deficit.items;

    const deficitStickyContent: ReactNode = (
        <div className={`${StyleClassPrefix}-sticky-content`}>
            <span>Deficit</span>
        </div>
    );

    const renderDeficitItemCell = (itemId: number): ReactNode => {
        let quantity: number | undefined;
        if (itemId === GameItemConstants.QpItemId) {
            quantity = resources.deficit.qp;
        } else {
            quantity = deficitItems[itemId];
        }
        return (
            <PlanRequirementsTableFooterCell
                key={itemId}
                active={itemId === activeItemId}
                displayZeroValues={displayZeroValues}
                hover={itemId === hoverItemId}
                itemId={itemId}
                quantity={quantity}
                onHover={onHover}
            />
        );
    };

    const deficitRow = (
        <DataTableGridRow
            borderTop
            stickyContent={deficitStickyContent}
        >
            {displayedItems.map(renderDeficitItemCell)}
        </DataTableGridRow>
    );

    //#endregion


    return (
        <div className={`${StyleClassPrefix}-root`}>
            {requiredRow}
            {inventoryRow}
            {deficitRow}
        </div>
    );

});
