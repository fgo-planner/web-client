import { ReadonlyPartial, ReadonlyRecord, SetUtils } from '@fgo-planner/common-core';
import { ImmutableMasterServant, MasterServantBondLevel, MasterServantUtils } from '@fgo-planner/data-core';
import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, MouseEventHandler, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { useMultiSelectHelperForMouseEvent } from '../../../../../../hooks/user-interface/list-select-helper/use-multi-select-helper-for-mouse-event.hook';
import { SortDirection, SortOptions } from '../../../../../../types/data';
import { GameServantUtils } from '../../../../../../utils/game/game-servant.utils';
import { MasterServantListColumn, MasterServantListVisibleColumns } from './master-servant-list-columns';
import { MasterServantListHeader } from './master-servant-list-header.component';
import { MasterServantListRow } from './master-servant-list-row.component';
import { MasterServantListStyle, StyleClassPrefix } from './master-servant-list.style';

type Props = {
    bondLevels: ReadonlyRecord<number, MasterServantBondLevel>;
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
    masterServants: ReadonlyArray<ImmutableMasterServant>;
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

    const gameServantMap = useGameServantMap();

    const {
        bondLevels,
        dragDropMode,
        masterServants,
        onDragOrderChange,
        onHeaderClick,
        onRowClick,
        onRowDoubleClick,
        onSelectionChange,
        onSortChange,
        selectedInstanceIds = SetUtils.emptySet(),
        showHeader,
        showUnsummonedServants,
        sortOptions,
        textFilter,
        visibleColumns
    } = props;

    const masterServantsProcessed = useMemo((): ReadonlyArray<ImmutableMasterServant> => {
        if (dragDropMode) {
            return masterServants;
        }
        let result = masterServants;
        const start1 = window.performance.now();
        // TODO Rework the filtering logic
        if (!showUnsummonedServants) {
            result = result.filter(({ summoned }) => summoned);
        }
        if (textFilter && gameServantMap) {
            result = GameServantUtils.filterServants(textFilter, [...result], ({ gameId }) => gameServantMap[gameId]);
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
            let paramA: number, paramB: number;
            switch (sort) {
                case 'npLevel':
                    paramA = a.np;
                    paramB = b.np;
                    break;
                case 'level':
                    paramA = a.level;
                    paramB = b.level;
                    break;
                case 'fouHp':
                    paramA = a.fouHp || -1;
                    paramB = b.fouHp || -1;
                    break;
                case 'fouAtk':
                    paramA = a.fouAtk || -1;
                    paramB = b.fouAtk || -1;
                    break;
                case 'bondLevel':
                    paramA = bondLevels[a.gameId] || -1;
                    paramB = bondLevels[b.gameId] || -1;
                    break;
                case 'summonDate':
                    paramA = a.summonDate?.getTime() || -1;
                    paramB = b.summonDate?.getTime() || -1;
                    break;
                default:
                    paramA = a.gameId;
                    paramB = b.gameId;
            }
            if (paramA === paramB) {
                paramA = a.gameId;
                paramB = b.gameId;
            }
            return direction === 'asc' ? paramA - paramB : paramB - paramA;
        });
        const end2 = window.performance.now();
        console.log(`Sorting by ${sort} ${direction} completed in ${(end2 - start2).toFixed(2)}ms.`);
        return result;
    }, [
        bondLevels,
        dragDropMode,
        gameServantMap,
        masterServants,
        showUnsummonedServants,
        sortOptions?.direction,
        sortOptions?.sort,
        textFilter
    ]);

    const {
        selectionResult,
        handleItemClick
    } = useMultiSelectHelperForMouseEvent(
        masterServantsProcessed,
        selectedInstanceIds,
        MasterServantUtils.getInstanceId,
        {
            disabled: dragDropMode,
            rightClickAction: 'contextmenu'
        }
    );

    useEffect(() => {
        onSelectionChange?.(selectionResult);
    }, [onSelectionChange, selectionResult]);

    const handleRowClick = useCallback((e: MouseEvent, index: number) => {
        handleItemClick(e, index);
        onRowClick?.(e);
    }, [handleItemClick, onRowClick]);

    //#region Component rendering

    /**
     * This can be undefined during the initial render.
     */
    if (!gameServantMap) {
        return null;
    }

    const renderMasterServantRow = (masterServant: ImmutableMasterServant, index: number): ReactNode => {
        const { gameId, instanceId } = masterServant;
        const gameServant = gameServantMap[gameId];
        const bondLevel = bondLevels[gameId];
        const active = selectedInstanceIds?.has(instanceId);

        return (
            <MasterServantListRow
                key={instanceId}
                index={index}
                gameServant={gameServant}
                bond={bondLevel}
                masterServant={masterServant}
                visibleColumns={visibleColumns}
                active={active}
                dragDropMode={dragDropMode}
                onDragOrderChange={onDragOrderChange}
                onClick={handleRowClick}
                onContextMenu={handleRowClick}
                onDoubleClick={onRowDoubleClick}
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
                        {masterServantsProcessed.map(renderMasterServantRow)}
                    </DndProvider>
                </div>
            </div>
        </RootComponent>
    );

    //#endregion

});
