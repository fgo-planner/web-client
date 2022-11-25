import { Immutable } from '@fgo-planner/common-core';
import clsx from 'clsx';
import React, { MouseEvent, ReactNode, useCallback } from 'react';
import { PlanServantAggregatedData, PlanServantRequirements } from '../../../../types';
import { DataTableGridRow } from '../../../data-table-grid/data-table-grid-row.component';
import { PlanRequirementsTableOptionsInternal } from './PlanRequirementsTableOptionsInternal.type';
import { PlanRequirementsTableServantRowCell } from './PlanRequirementsTableServantRowCell';
import { PlanRequirementsTableServantRowHeader } from './PlanRequirementsTableServantRowHeader';

type Props = {
    active?: boolean;
    borderBottom?: boolean;
    borderTop?: boolean;
    index: number;
    options: PlanRequirementsTableOptionsInternal;
    planServantData: Immutable<PlanServantAggregatedData>;
    servantRequirements: PlanServantRequirements;
    onClick?: (e: MouseEvent, index: number) => void;
    onContextMenu?: (e: MouseEvent, index: number) => void;
    onDoubleClick?: (e: MouseEvent, index: number) => void;
    // onDragOrderChange?: (sourceInstanceId: number, destinationInstanceId: number) => void;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRow';

export const PlanRequirementsTableServantRow = React.memo((props: Props) => {

    const {
        active,
        borderBottom,
        borderTop,
        index,
        options,
        planServantData: {
            gameServant
        },
        servantRequirements,
        onClick,
        onContextMenu,
        onDoubleClick,
        // onDragOrderChange
    } = props;

    
    //#region Input event handlers

    const handleClick = useCallback((e: MouseEvent): void => {
        onClick?.(e, index);
    }, [index, onClick]);

    const handleContextMenu = useCallback((e: MouseEvent): void => {
        onContextMenu?.(e, index);
    }, [index, onContextMenu]);

    const handleDoubleClick = useCallback((e: MouseEvent): void => {
        onDoubleClick?.(e, index);
    }, [index, onDoubleClick]);

    //#endregion


    //#region Component rendering
    
    const rowHeaderNode: ReactNode = (
        <PlanRequirementsTableServantRowHeader
            gameServant={gameServant}
            options={options}
        />
    );

    const itemRequirements = servantRequirements.requirements.items;

    const renderItemCell = (itemId: number): ReactNode => {
        const itemQuantity = itemRequirements[itemId]?.total;
        return (
            <PlanRequirementsTableServantRowCell
                key={itemId}
                quantity={itemQuantity}
                options={options}
                // backgroundColor={palette.background.paper}
            />
        );
    };

    const className = clsx(
        `${StyleClassPrefix}-root`,
        active && `${StyleClassPrefix}-active`
    );

    return (
        <DataTableGridRow
            className={className}
            borderTop={borderTop}
            borderBottom={borderBottom}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            stickyContent={rowHeaderNode}
        >
            {options.displayedItems.map(renderItemCell)}
        </DataTableGridRow>
    );

    //#endregion

});
