import { Immutable } from '@fgo-planner/common-core';
import { GameItemConstants } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { MouseEvent, ReactNode, useCallback } from 'react';
import { PlanServantAggregatedData, PlanServantRequirements } from '../../../../types';
import { DataTableGridRow } from '../../../data-table-grid/data-table-grid-row.component';
import { PlanRequirementsTableOptionsInternal } from './PlanRequirementsTableOptionsInternal.type';
import { PlanRequirementsTableServantRowCell } from './PlanRequirementsTableServantRowCell';
import { PlanRequirementsTableServantRowHeader } from './PlanRequirementsTableServantRowHeader';

type Props = {
    active?: boolean;
    activeItemId?: number;
    borderBottom?: boolean;
    borderTop?: boolean;
    hover: boolean;
    hoverItemId: number | undefined;
    index: number;
    options: PlanRequirementsTableOptionsInternal;
    planServantData: Immutable<PlanServantAggregatedData>;
    servantRequirements: PlanServantRequirements;
    onClick?: (e: MouseEvent, index: number) => void;
    onContextMenu?: (e: MouseEvent, index: number) => void;
    onDoubleClick?: (e: MouseEvent, index: number) => void;
    onHover: (index: number, itemId?: number) => void;
    // onDragOrderChange?: (sourceInstanceId: number, destinationInstanceId: number) => void;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRow';

export const PlanRequirementsTableServantRow = React.memo((props: Props) => {

    const {
        active,
        activeItemId,
        borderBottom,
        borderTop,
        hover,
        hoverItemId,
        index,
        options: {
            displayedItems,
            servantRowHeaderMode
        },
        planServantData,
        servantRequirements,
        onClick,
        onContextMenu,
        onDoubleClick,
        onHover
        // onDragOrderChange
    } = props;

    
    //#region Input event handlers

    const handleClick = useCallback((event: MouseEvent): void => {
        onClick?.(event, index);
    }, [index, onClick]);

    const handleContextMenu = useCallback((event: MouseEvent): void => {
        onContextMenu?.(event, index);
    }, [index, onContextMenu]);

    const handleDoubleClick = useCallback((event: MouseEvent): void => {
        onDoubleClick?.(event, index);
    }, [index, onDoubleClick]);

    const handleMouseEnter = useCallback((_event: MouseEvent): void => {
        onHover(index);
    }, [index, onHover]);

    //#endregion


    //#region Component rendering
    
    const rowHeaderNode: ReactNode = (
        <PlanRequirementsTableServantRowHeader
            planServantData={planServantData}
            servantRowHeaderMode={servantRowHeaderMode}
        />
    );

    const itemRequirements = servantRequirements.requirements.items;

    const renderItemCell = (itemId: number): ReactNode => {
        let itemQuantity: number | undefined;
        if (itemId === GameItemConstants.QpItemId) {
            itemQuantity = servantRequirements.requirements.qp;
        } else {
            itemQuantity = itemRequirements[itemId]?.total;
        }
        return (
            <PlanRequirementsTableServantRowCell
                key={itemId}
                active={active || itemId === activeItemId}
                hover={hover || itemId === hoverItemId}
                quantity={itemQuantity}
            />
        );
    };

    const className = clsx(
        `${StyleClassPrefix}-root`,
        active && `${StyleClassPrefix}-active`,
        hover && `${StyleClassPrefix}-hover`
    );

    return (
        <DataTableGridRow
            className={className}
            borderTop={borderTop}
            borderBottom={borderBottom}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            onMouseEnter={handleMouseEnter}
            stickyContent={rowHeaderNode}
        >
            {displayedItems.map(renderItemCell)}
        </DataTableGridRow>
    );

    //#endregion

});
