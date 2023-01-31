import { CollectionUtils, ReadonlyPartial, ReadonlyRecord } from '@fgo-planner/common-core';
import { InstantiatedServantBondLevel, InstantiatedServantUtils, MasterServantAggregatedData } from '@fgo-planner/data-core';
import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, MouseEventHandler, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useGameServantKeywordsMap } from '../../../../../../hooks/data/useGameServantKeywordsMap';
import { useMultiSelectHelperForMouseEvent } from '../../../../../../hooks/user-interface/list-select-helper/use-multi-select-helper-for-mouse-event.hook';
import { SortDirection, SortOptions } from '../../../../../../types';
import { DataAggregationUtils } from '../../../../../../utils/data-aggregation.utils';
import { GameServantUtils } from '../../../../../../utils/game/game-servant.utils';
import { MasterServantListColumn, MasterServantListVisibleColumns } from './master-servant-list-columns';
import { MasterServantListHeader } from './master-servant-list-header.component';
import { MasterServantListRow } from './master-servant-list-row.component';
import { MasterServantListStyle, StyleClassPrefix } from './master-servant-list.style';

type Props = {
    bondLevels: ReadonlyRecord<number, InstantiatedServantBondLevel>;
    /**
     * Whether drag-drop mode is active. Drag-drop mode is intended for the user to
     * rearrange the default ordering of the list. As such, when in drag-drop mode,
     * the list will be displayed without any sorting applied.
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
    sortOptions?: SortOptions<MasterServantListColumn>;
    textFilter?: string; // TODO Combine this with the rest of filters.
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    viewLayout?: any; // TODO Make use of this
    onDragOrderChange?: (sourceInstanceId: number, destinationInstanceId: number) => void;
    onHeaderClick?: MouseEventHandler;
    onRowClick?: MouseEventHandler;
    onRowDoubleClick?: MouseEventHandler;
    onSelectionChange?: (selectedInstanceIds: ReadonlySet<number>) => void;
    onSortChange?: (column?: MasterServantListColumn, direction?: SortDirection) => void;
};

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
        onDragOrderChange,
        onHeaderClick,
        onRowClick,
        onRowDoubleClick,
        onSelectionChange,
        onSortChange,
        selectedInstanceIds = CollectionUtils.emptySet(),
        showHeader,
        showUnsummonedServants,
        sortOptions,
        textFilter,
        visibleColumns
    } = props;

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
                gameServantsKeywordsMap || {},
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
                    paramA = bondLevels[masterServantA.gameId] || -1;
                    paramB = bondLevels[masterServantB.gameId] || -1;
                    break;
                case 'summonDate':
                    paramA = masterServantA.summonDate?.getTime() || -1;
                    paramB = masterServantB.summonDate?.getTime() || -1;
                    break;
                default:
                    paramA = masterServantA.gameId;
                    paramB = masterServantB.gameId;
            }
            if (paramA === paramB) {
                paramA = masterServantA.gameId;
                paramB = masterServantB.gameId;
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

    const handleRowDoubleClick = useCallback((e: MouseEvent, index: number) => {
        blockedRowClickIndex.current = index;
        onRowDoubleClick?.(e);
    }, [onRowDoubleClick]);


    //#region Component rendering

    const renderMasterServantRow = (masterServantData: MasterServantAggregatedData, index: number): ReactNode => {
        const masterServant = masterServantData.masterServant;
        const { gameId, instanceId } = masterServant;
        const bondLevel = bondLevels[gameId];
        const active = selectedInstanceIds?.has(instanceId);

        return (
            <MasterServantListRow
                key={instanceId}
                index={index}
                gameServant={masterServantData.gameServant}
                bond={bondLevel}
                masterServant={masterServant}
                visibleColumns={visibleColumns}
                active={active}
                dragDropMode={dragDropMode}
                onDragOrderChange={onDragOrderChange}
                onClick={handleRowClick}
                onContextMenu={handleRowClick}
                onDoubleClick={handleRowDoubleClick}
            />
        );
    };

    return (
        <RootComponent className={`${StyleClassPrefix}-root`}>
            <div className={`${StyleClassPrefix}-list-container`}>
                {showHeader && <MasterServantListHeader
                    sortEnabled
                    dragDropMode={dragDropMode}
                    visibleColumns={visibleColumns}
                    sortOptions={sortOptions}
                    onClick={onHeaderClick}
                    onSortChange={onSortChange}
                />}
                <div className={clsx(`${StyleClassPrefix}-list`, dragDropMode && 'drag-drop-mode')}>
                    <DndProvider backend={HTML5Backend}>
                        {displayedMasterServantsData.map(renderMasterServantRow)}
                    </DndProvider>
                </div>
            </div>
        </RootComponent>
    );

    //#endregion

});
