import { Immutable, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameItemConstants, PlanServantAggregatedData } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { DragEvent, DragEventHandler, MouseEvent, ReactNode, useCallback, useMemo } from 'react';
import { PlanServantRequirements } from '../../../../types';
import { DataTableGridRow } from '../../../data-table-grid/DataTableGridRow';
import { PlanRequirementsTableOptionsInternal } from './PlanRequirementsTableOptionsInternal.type';
import { PlanRequirementsTableServantRowCell } from './PlanRequirementsTableServantRowCell';
import { PlanRequirementsTableServantRowHeader } from './PlanRequirementsTableServantRowHeader';

type Props = {
    active?: boolean;
    activeItemId?: number;
    borderBottom?: boolean;
    borderTop?: boolean;
    dragDropMode?: boolean;
    hover: boolean;
    hoverItemId: number | undefined;
    idPrefix?: string;
    index: number;
    options: PlanRequirementsTableOptionsInternal;
    planServantData: Immutable<PlanServantAggregatedData>;
    targetCostumes: ReadonlySet<number>;
    unlockedCostumes: ReadonlyRecord<number, boolean>;
    servantRequirements: PlanServantRequirements;
    onClick?(e: MouseEvent, index: number): void;
    onContextMenu?(e: MouseEvent, index: number): void;
    onDoubleClick?(e: MouseEvent, index: number): void;
    onDragStart?(event: DragEvent, instanceId: number): void;
    onHover(index: number, itemId?: number): void;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRow';

export const PlanRequirementsTableServantRow = React.memo((props: Props) => {

    const {
        active,
        activeItemId,
        borderBottom,
        borderTop,
        dragDropMode,
        hover,
        hoverItemId,
        idPrefix,
        index,
        options: {
            displayedItems,
            servantRowHeaderMode
        },
        planServantData,
        servantRequirements,
        targetCostumes,
        unlockedCostumes,
        onClick,
        onContextMenu,
        onDoubleClick,
        onDragStart,
        onHover
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

    const handleDragStart = useMemo((): DragEventHandler | undefined => {
        if (!dragDropMode || !onDragStart) {
            return undefined;
        }
        return (event: DragEvent): void => {
            onDragStart(event, index);
        };
    }, [dragDropMode, index, onDragStart]);

    //#endregion


    //#region Component rendering

    const rowHeaderNode: ReactNode = (
        <PlanRequirementsTableServantRowHeader
            dragDropMode={dragDropMode}
            planServantData={planServantData}
            servantRowHeaderMode={servantRowHeaderMode}
            targetCostumes={targetCostumes}
            unlockedCostumes={unlockedCostumes}
            onDragStart={handleDragStart}
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

    const id = idPrefix && `${idPrefix}${index}`;

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
            id={id}
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
