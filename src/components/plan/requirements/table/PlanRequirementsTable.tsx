import { CollectionUtils, Functions, Immutable, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameItemConstants, InstantiatedServantUtils, PlanServantAggregatedData } from '@fgo-planner/data-core';
import { Box } from '@mui/system';
import clsx from 'clsx';
import React, { CSSProperties, DragEvent, DragEventHandler, MouseEvent, MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameItemCategoryMap } from '../../../../hooks/data/useGameItemCategoryMap';
import { useMultiSelectHelperForMouseEvent } from '../../../../hooks/user-interface/list-select-helper/useMultiSelectHelperForMouseEvent';
import { useDragDropEventHandlers } from '../../../../hooks/user-interface/useDragDropEventHandlers';
import { GameItemCategory, GameItemCategoryMap, PlanRequirements } from '../../../../types';
import { DataTableDropTargetIndicator } from '../../../data-table/DataTableDropTargetIndicator';
import { PlanRequirementsTableFooter } from './PlanRequirementsTableFooter';
import { PlanRequirementsTableHeader } from './PlanRequirementsTableHeader';
import { PlanRequirementsTableOptions } from './PlanRequirementsTableOptions.type';
import { PlanRequirementsTableOptionsInternal } from './PlanRequirementsTableOptionsInternal.type';
import { PlanRequirementsTableServantRow, StyleClassPrefix as PlanRequirementsTableServantRowStyleClassPrefix } from './PlanRequirementsTableServantRow';
import { PlanRequirementsTableStyle } from './PlanRequirementsTableStyle';

type Props = {
    /**
     * Whether drag-drop mode is active. Row highlighting will not be displayed for
     * selected servants.
     */
    dragDropMode?: boolean;
    options: PlanRequirementsTableOptions;
    /**
     * The computed requirements for the plan.
     */
    planRequirements: PlanRequirements;
    planServantsData: ReadonlyArray<PlanServantAggregatedData>;
    hideEmptyColumns?: boolean;
    /**
     * Instance IDs of selected servants.
     */
    selectedInstanceIds?: ReadonlySet<number>;
    targetCostumes: ReadonlySet<number>;
    unlockedCostumes: ReadonlyRecord<number, boolean>;
    onDragOrderChange?(sourceIndex: number, destinationIndex: number): void;
    onEditMasterItems?(): void;
    onRowClick?: MouseEventHandler;
    onRowDoubleClick?: MouseEventHandler;
    onSelectionChange?(selectedInstanceIds: ReadonlySet<number>): void;
};

type HoverState = {
    rowIndex?: number;
    itemId?: number;
};

const TableRowIdPrefix = `${PlanRequirementsTableServantRowStyleClassPrefix}-`;

const CellSizeCondensed = 0.8125;
const CellSizeNormal = 1.0;

const getDisplayedItems = (
    gameItemCategoryMap: GameItemCategoryMap,
    planRequirements: Immutable<PlanRequirements>,
    itemDisplayOptions: PlanRequirementsTableOptions['displayItems']
): Array<number> => {
    /** 
     * Build unfiltered list of item IDs based on display options.
     */
    /** */
    let items = [
        ...gameItemCategoryMap[GameItemCategory.BronzeEnhancementMaterials],
        ...gameItemCategoryMap[GameItemCategory.SilverEnhancementMaterials],
        ...gameItemCategoryMap[GameItemCategory.GoldEnhancementMaterials]
    ];
    if (itemDisplayOptions.statues) {
        items.push(...gameItemCategoryMap[GameItemCategory.AscensionStatues]);
    }
    if (itemDisplayOptions.grails) {
        items.push(GameItemConstants.GrailItemId);
    }
    if (itemDisplayOptions.gems) {
        items.push(...gameItemCategoryMap[GameItemCategory.SkillGems]);
    }
    if (itemDisplayOptions.lores) {
        items.push(GameItemConstants.LoreItemId);
    }
    /** 
     * If only required items are displayed, then filter out all the empty
     * (undefined) values.
     */
    if (!itemDisplayOptions.empty) {
        const groupItems = planRequirements.requirements.group.items;
        items = items.filter(itemId => groupItems[itemId] !== undefined);
    }
    /**
     * QP is a special case that needs to be added last.
     */
    if (itemDisplayOptions.qp) {
        items.push(GameItemConstants.QpItemId);
    }
    return items;
};

export const StyleClassPrefix = 'PlanRequirementsTable';

export const PlanRequirementsTable = React.memo((props: Props) => {

    const gameItemCategoryMap = useGameItemCategoryMap();

    const {
        dragDropMode,
        options,
        planRequirements,
        planServantsData,
        selectedInstanceIds = CollectionUtils.emptySet(),
        targetCostumes,
        unlockedCostumes,
        onDragOrderChange,
        onEditMasterItems,
        onRowClick,
        onRowDoubleClick,
        onSelectionChange
    } = props;

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const {
        destinationIndex,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleRowDragEnd,
        handleRowDragStart,
    } = useDragDropEventHandlers(
        TableRowIdPrefix,
        scrollContainerRef
    );

    const {
        selectionResult,
        handleItemClick
    } = useMultiSelectHelperForMouseEvent(
        planServantsData,
        selectedInstanceIds,
        InstantiatedServantUtils.getInstanceId,
        {
            // disabled: dragDropMode,
            rightClickAction: 'contextmenu'
        }
    );

    /**
     * Notify parent component whenever selection has changed.
     */
    useEffect(() => {
        onSelectionChange?.(selectionResult);
    }, [onSelectionChange, selectionResult]);

    const [hoverState, setHoverState] = useState<HoverState>(Functions.emptyObjectSupplier);

    const displayedItems = useMemo((): Array<number> => {
        if (!gameItemCategoryMap) {
            return [];
        }
        return getDisplayedItems(
            gameItemCategoryMap,
            planRequirements,
            options.displayItems
        );
    }, [gameItemCategoryMap, planRequirements, options.displayItems]);

    const internalTableOptions = useMemo((): PlanRequirementsTableOptionsInternal => {

        const {
            displayZeroValues = false,
            layout: {
                rowHeader: servantRowHeaderMode
            }
        } = options;

        return {
            displayedItems,
            displayZeroValues,
            servantRowHeaderMode
        };
    }, [displayedItems, options]);

    const scalingStyle = useMemo((): CSSProperties => {
        const scale = options.layout.cells === 'condensed' ? CellSizeCondensed : CellSizeNormal;
        return {
            fontSize: `${scale}rem`
        } as CSSProperties;
    }, [options.layout.cells]);


    //#region Input event handlers

    const handleRowClick = useCallback((e: MouseEvent, index: number) => {
        handleItemClick(e, index);
        onRowClick?.(e);
    }, [handleItemClick, onRowClick]);

    const handleHover = useCallback((rowIndex?: number, itemId?: number) => {
        setHoverState({
            rowIndex,
            itemId
        });
    }, []);

    const handleTableContainerMouseLeave = useCallback((_event: MouseEvent) => {
        setHoverState({
            rowIndex: undefined,
            itemId: undefined
        });
    }, []);

    const handleDragStart = useMemo((): ((event: DragEvent, index: number) => void) | undefined => {
        if (!dragDropMode) {
            return undefined;
        }
        return handleRowDragStart;
    }, [dragDropMode, handleRowDragStart]);

    const handleDragEnd = useMemo((): DragEventHandler | undefined => {
        if (!dragDropMode || !onDragOrderChange) {
            return undefined;
        }
        return (event: DragEvent): void => {
            const { sourceIndex, destinationIndex } = handleRowDragEnd(event);
            onDragOrderChange(sourceIndex, destinationIndex);
        };
    }, [dragDropMode, handleRowDragEnd, onDragOrderChange]);

    //#endregion


    //#region Component rendering

    const requirements = planRequirements.requirements.servants;

    const renderPlanServantRow = (planServantData: PlanServantAggregatedData, index: number): ReactNode => {
        const instanceId = planServantData.instanceId;
        const servantRequirements = requirements[instanceId];
        if (!servantRequirements) {
            /**
             * No need to log/throw error here since it's expected to be null during initial
             * render.
             */
            return null;
        }
        const active = !dragDropMode && selectedInstanceIds?.has(instanceId);
        const hover = hoverState.rowIndex === index;

        const planServantRowNode = (
            <PlanRequirementsTableServantRow
                key={instanceId}
                active={active}
                borderTop={!!index}
                dragDropMode={dragDropMode}
                hover={hover}
                hoverItemId={hoverState.itemId}
                idPrefix={TableRowIdPrefix}
                index={index}
                options={internalTableOptions}
                planServantData={planServantData}
                servantRequirements={servantRequirements}
                targetCostumes={targetCostumes}
                unlockedCostumes={unlockedCostumes}
                onClick={handleRowClick}
                onContextMenu={handleRowClick}
                onDoubleClick={onRowDoubleClick}
                onDragStart={handleDragStart}
                onHover={handleHover}
            />
        );

        if (destinationIndex === index) {
            return [
                <DataTableDropTargetIndicator key={-1} />,
                planServantRowNode
            ];
        } else if (destinationIndex === planServantsData.length && index === planServantsData.length - 1) {
            return [
                planServantRowNode,
                <DataTableDropTargetIndicator key={-1} />
            ];
        } else {
            return planServantRowNode;
        }
    };

    const classNames = clsx(
        `${StyleClassPrefix}-root`,
        dragDropMode && `${StyleClassPrefix}-drag-drop-mode`
    );

    return (
        <Box className={classNames} sx={PlanRequirementsTableStyle}>
            <div
                ref={scrollContainerRef}
                className={`${StyleClassPrefix}-table-container`}
                style={scalingStyle}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDragEnd}
                onMouseLeave={handleTableContainerMouseLeave}
            >
                <PlanRequirementsTableHeader
                    hoverItemId={hoverState.itemId}
                    options={internalTableOptions}
                    onHover={handleHover}
                />
                {planServantsData.map(renderPlanServantRow)}
                <PlanRequirementsTableFooter
                    hoverItemId={hoverState.itemId}
                    planRequirements={planRequirements}
                    options={internalTableOptions}
                    onEditMasterItems={onEditMasterItems}
                    onHover={handleHover}
                />
            </div>
        </Box>
    );

    //#endregion

});
