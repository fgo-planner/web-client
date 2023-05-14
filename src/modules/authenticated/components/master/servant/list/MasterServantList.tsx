import { CollectionUtils, ReadonlyRecord } from '@fgo-planner/common-core';
import { InstantiatedServantBondLevel, InstantiatedServantUtils, MasterServantAggregatedData } from '@fgo-planner/data-core';
import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { DragEvent, DragEventHandler, MouseEvent, MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { DataTableList } from '../../../../../../components/data-table-list/DataTableList';
import { useGameServantKeywordsMap } from '../../../../../../hooks/data/useGameServantKeywordsMap';
import { useMultiSelectHelperForMouseEvent } from '../../../../../../hooks/user-interface/list-select-helper/useMultiSelectHelperForMouseEvent';
import { useDragDropEventHandlers } from '../../../../../../hooks/user-interface/useDragDropEventHandlers';
import { SortDirection, SortOptions } from '../../../../../../types';
import { DataAggregationUtils } from '../../../../../../utils/DataAggregationUtils';
import { GameServantUtils } from '../../../../../../utils/game/GameServantUtils';
import { MasterServantListColumn } from './MasterServantListColumn';
import { MasterServantListHeader } from './MasterServantListHeader';
import { MasterServantListRow, StyleClassPrefix as MasterServantListRowStyleClassPrefix } from './MasterServantListRow';
import { MasterServantListRowHeight, MasterServantListStyle, StyleClassPrefix } from './MasterServantListStyle';

type Props = {
    bondLevels: ReadonlyRecord<number, InstantiatedServantBondLevel>;
    /**
     * Whether drag-drop mode is active. Drag-drop mode is intended for the user to
     * rearrange the default ordering of the list. As such, when in drag-drop mode,
     * the list will be displayed without any sorting applied. In addition, row
     * highlighting will not be displayed for selected servants.
     */
    dragDropMode?: boolean;
    /**
     * The list of servants to be displayed. Filtering should be already applied to
     * the list by the parent component. The only transformation handled by this
     * component is sorting.
     */
    masterServantsData: ReadonlyArray<MasterServantAggregatedData>;
    /**
     * Instance IDs of selected servants.
     */
    selectedInstanceIds?: ReadonlySet<number>;
    showHeader?: boolean;
    showUnsummonedServants?: boolean; // TODO Combine this with the rest of filters.
    sortOptions?: SortOptions<MasterServantListColumn.Name>;
    textFilter?: string; // TODO Combine this with the rest of filters.
    virtualList?: boolean;
    visibleColumns?: Readonly<MasterServantListColumn.Visibility>;
    viewLayout?: any; // TODO Make use of this
    onDragOrderChange?(sourceIndex: number, destinationIndex: number): void;
    onHeaderClick?: MouseEventHandler;
    onRowClick?: MouseEventHandler;
    onRowDoubleClick?: MouseEventHandler;
    onSelectionChange?(selectedInstanceIds: ReadonlySet<number>): void;
    onSortChange?(column?: MasterServantListColumn.Name, direction?: SortDirection): void;
};

const ListRowIdPrefix = `${MasterServantListRowStyleClassPrefix}-`;

const StyledOptions = {
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions;

const RootComponent = styled('div', StyledOptions)(MasterServantListStyle);

export const MasterServantList = React.memo((props: Props) => {

    /**
     * TODO Make this optional.
     */
    const gameServantsKeywordsMap = useGameServantKeywordsMap();

    const {
        bondLevels,
        dragDropMode,
        masterServantsData,
        selectedInstanceIds = CollectionUtils.emptySet(),
        showHeader,
        showUnsummonedServants,
        sortOptions,
        textFilter,
        virtualList,
        visibleColumns,
        onDragOrderChange,
        onHeaderClick,
        onRowClick,
        onRowDoubleClick,
        onSelectionChange,
        onSortChange
    } = props;

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    /**
     * Due to the `onClick` event potentially firing before the `onDoubleClick` for
     * the same click, we need a way to prevent the `onClick` event on a row from
     * doing anything if the a `onDoubleClick` was also triggered in the same click.
     *
     * The row with this index will have its `onClick` events negated.
     */
    const blockedRowClickIndex = useRef<number>();

    const displayedMasterServantsData = useMemo((): ReadonlyArray<MasterServantAggregatedData> => {
        if (dragDropMode) {
            return masterServantsData;
        }
        let result = masterServantsData;
        const start1 = window.performance.now();
        // TODO Rework the filtering logic
        if (!showUnsummonedServants) {
            result = result.filter(servantData => servantData.masterServant.summoned);
        }
        if (textFilter) {
            result = GameServantUtils.filterServants(
                gameServantsKeywordsMap || CollectionUtils.emptyMap(),
                textFilter,
                result,
                DataAggregationUtils.getGameServant
            );
        }
        const end1 = window.performance.now();
        console.log(`Filtering completed in ${(end1 - start1).toFixed(2)}ms.`);
        const sort = sortOptions?.sort;
        if (!sort) {
            return result;
        }
        const direction = sortOptions.direction;
        const start2 = window.performance.now();
        // TODO Move this to utilities class.
        result = [...result].sort((a, b): number => {
            const masterServantA = a.masterServant;
            const masterServantB = b.masterServant;
            let paramA: number, paramB: number;
            switch (sort) {
                case 'npLevel':
                    paramA = masterServantA.np;
                    paramB = masterServantB.np;
                    break;
                case 'level':
                    paramA = masterServantA.level;
                    paramB = masterServantB.level;
                    break;
                case 'fouHp':
                    paramA = masterServantA.fouHp || -1;
                    paramB = masterServantB.fouHp || -1;
                    break;
                case 'fouAtk':
                    paramA = masterServantA.fouAtk || -1;
                    paramB = masterServantB.fouAtk || -1;
                    break;
                case 'bondLevel':
                    paramA = bondLevels[masterServantA.servantId] || -1;
                    paramB = bondLevels[masterServantB.servantId] || -1;
                    break;
                case 'summonDate':
                    paramA = masterServantA.summonDate?.getTime() || -1;
                    paramB = masterServantB.summonDate?.getTime() || -1;
                    break;
                default:
                    paramA = masterServantA.servantId;
                    paramB = masterServantB.servantId;
            }
            if (paramA === paramB) {
                paramA = masterServantA.servantId;
                paramB = masterServantB.servantId;
            }
            return direction === 'asc' ? paramA - paramB : paramB - paramA;
        });
        const end2 = window.performance.now();
        console.log(`Sorting by ${sort} ${direction} completed in ${(end2 - start2).toFixed(2)}ms.`);
        return result;
    }, [
        bondLevels,
        dragDropMode,
        gameServantsKeywordsMap,
        masterServantsData,
        showUnsummonedServants,
        sortOptions?.direction,
        sortOptions?.sort,
        textFilter
    ]);

    const {
        destinationIndex,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleRowDragEnd,
        handleRowDragStart,
    } = useDragDropEventHandlers(
        ListRowIdPrefix,
        scrollContainerRef
    );

    const {
        selectionResult,
        handleItemClick
    } = useMultiSelectHelperForMouseEvent(
        displayedMasterServantsData,
        selectedInstanceIds,
        InstantiatedServantUtils.getInstanceId,
        {
            disabled: dragDropMode,
            rightClickAction: 'contextmenu'
        }
    );

    useEffect(() => {
        onSelectionChange?.(selectionResult);
    }, [onSelectionChange, selectionResult]);

    const handleRowClick = useCallback((e: MouseEvent, index: number) => {
        if (e.type === 'contextmenu') {
            e.preventDefault();
        }
        /**
         * Need to set timeout here so ensure that the `onDoubleClick` event get
         * processed before the `onClick` event.
         */
        setTimeout(() => {
            if (blockedRowClickIndex.current !== index) {
                handleItemClick(e, index);
                onRowClick?.(e);
            }
            /**
             * Only at most one `onClick` event should be blocked each time this is set...
             * so we always reset it here.
             */
            blockedRowClickIndex.current = undefined;
        });
    }, [handleItemClick, onRowClick]);

    const handleRowDoubleClick = useCallback((event: MouseEvent, index: number):void => {
        blockedRowClickIndex.current = index;
        onRowDoubleClick?.(event);
    }, [onRowDoubleClick]);

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


    //#region Component rendering

    const renderMasterServantRow = useCallback((masterServantData: MasterServantAggregatedData, index: number): ReactNode => {
        const masterServant = masterServantData.masterServant;
        const { servantId, instanceId } = masterServant;
        const bondLevel = bondLevels[servantId];
        const active = !dragDropMode && selectedInstanceIds?.has(instanceId);

        return (
            <MasterServantListRow
                key={instanceId}
                active={active}
                bond={bondLevel}
                disablePointerEvents={destinationIndex !== undefined}
                dragDropMode={dragDropMode}
                gameServant={masterServantData.gameServant}
                idPrefix={ListRowIdPrefix}
                index={index}
                masterServant={masterServant}
                visibleColumns={visibleColumns}
                onDragStart={handleDragStart}
                onClick={handleRowClick}
                onContextMenu={handleRowClick}
                onDoubleClick={handleRowDoubleClick}
            />
        );
    }, [
        bondLevels,
        destinationIndex,
        dragDropMode,
        handleDragStart,
        handleRowClick,
        handleRowDoubleClick,
        selectedInstanceIds,
        visibleColumns
    ]);

    const listClassNames = clsx(
        `${StyleClassPrefix}-list`,
        dragDropMode && `${StyleClassPrefix}-drag-drop-mode`
    );

    return (
        <RootComponent className={`${StyleClassPrefix}-root`}>
            <div
                ref={scrollContainerRef}
                className={`${StyleClassPrefix}-list-container`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDragEnd}
            >
                {showHeader && <MasterServantListHeader
                    sortEnabled
                    dragDropMode={dragDropMode}
                    visibleColumns={visibleColumns}
                    sortOptions={sortOptions}
                    onClick={onHeaderClick}
                    onSortChange={onSortChange}
                />}
                <DataTableList
                    className={listClassNames}
                    data={displayedMasterServantsData}
                    dropTargetIndex={destinationIndex}
                    rowHeight={MasterServantListRowHeight}
                    rowRenderFunction={renderMasterServantRow}
                    scrollContainerRef={scrollContainerRef}
                    virtual={virtualList}
                    virtualRowBuffer={16} // TODO make this configurable
                />
            </div>
        </RootComponent>
    );

    //#endregion

});
