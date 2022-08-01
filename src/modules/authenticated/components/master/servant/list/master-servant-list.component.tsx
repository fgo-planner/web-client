import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, MouseEventHandler, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StyleClassPrefix as GameServantThumbnailStyleClassPrefix } from '../../../../../../components/game/servant/game-servant-thumbnail.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { useListSelectHelper } from '../../../../../../hooks/user-interface/use-list-select-helper.hook';
import { SortDirection, SortOptions } from '../../../../../../types/data';
import { Immutable, ImmutableArray, ReadonlyPartial } from '../../../../../../types/internal';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { SetUtils } from '../../../../../../utils/set.utils';
import { MasterServantColumnProperties, MasterServantListColumn, MasterServantListVisibleColumns } from './master-servant-list-columns';
import { MasterServantListHeader } from './master-servant-list-header.component';
import { StyleClassPrefix as MasterServantListRowBondLevelStyleClassPrefix } from './master-servant-list-row-bond-level.component';
import { StyleClassPrefix as MasterServantListRowFouLevelStyleClassPrefix } from './master-servant-list-row-fou-level.component';
import { StyleClassPrefix as MasterServantListRowLabelStyleClassPrefix } from './master-servant-list-row-label.component';
import { StyleClassPrefix as MasterServantListRowLevelStyleClassPrefix } from './master-servant-list-row-level.component';
import { StyleClassPrefix as MasterServantListRowNpLevelStyleClassPrefix } from './master-servant-list-row-np-level.component';
import { StyleClassPrefix as MasterServantListRowSkillLevelStyleClassPrefix } from './master-servant-list-row-skill-level.component';
import { StyleClassPrefix as MasterServantListRowStatsStyleClassPrefix } from './master-servant-list-row-stats.component';
import { MasterServantListRow, StyleClassPrefix as MasterServantListRowStyleClassPrefix } from './master-servant-list-row.component';

type Props = {
    bondLevels: Record<number, MasterServantBondLevel>;
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
    masterServants: ImmutableArray<MasterServant>;
    /**
     * Instance IDs of selected servants.
     */
    selectedServants?: ReadonlySet<number>;
    showHeader?: boolean;
    sortOptions?: SortOptions<MasterServantListColumn>;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    viewLayout?: any; // TODO Make use of this
    onDragOrderChange?: (sourceInstanceId: number, destinationInstanceId: number) => void;
    onHeaderClick?: MouseEventHandler;
    onRowClick?: MouseEventHandler;
    onRowDoubleClick?: MouseEventHandler;
    onSelectionChange?: (selectedServants: ReadonlySet<number>) => void;
    onSortChange?: (column?: MasterServantListColumn, direction?: SortDirection) => void;
};

export const StyleClassPrefix = 'MasterServantList';

const StyleProps = (theme: SystemTheme) => {

    const {
        palette,
        spacing
    } = theme as Theme;

    return {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        [`& .${StyleClassPrefix}-list-container`]: {
            backgroundColor: palette.background.paper,
            height: '100%',
            overflow: 'auto',
            [`& .${StyleClassPrefix}-list`]: {
                [`& .${MasterServantListRowStyleClassPrefix}-root`]: {
                    width: 'fit-content',
                    minWidth: '100%',
                    [`& .${MasterServantListRowStyleClassPrefix}-content`]: {
                        userSelect: 'none',
                        flex: 1,
                        display: 'flex',
                        alignContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        height: 52,
                        fontSize: '0.875rem',
                        [`& .${MasterServantListRowLabelStyleClassPrefix}-root`]: {
                            display: 'flex',
                            alignItems: 'center',
                            width: MasterServantColumnProperties.label.width,
                            [`& .${MasterServantListRowLabelStyleClassPrefix}-class-icon`]: {
                                pl: 4
                            },
                            [`& .${MasterServantListRowLabelStyleClassPrefix}-rarity`]: {
                                minWidth: spacing(7),  // 28px
                                px: 4
                            }
                        },
                        [`& .${MasterServantListRowStatsStyleClassPrefix}-root`]: {
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            [`& .${MasterServantListRowNpLevelStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.npLevel.width,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '& img': {
                                    pr: 1,
                                    width: '18px',
                                    height: '18px'
                                }
                            },
                            [`& .${MasterServantListRowLevelStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.level.width,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&>.value': {
                                    width: '28px',
                                    textAlign: 'right',
                                    pr: 3
                                },
                                '&>img': {
                                    width: '16px',
                                    height: '16px'
                                },
                                '&>.ascension': {
                                    width: '16px'
                                }
                            },
                            [`& .${MasterServantListRowFouLevelStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.fouHp.width
                            },
                            [`& .${MasterServantListRowSkillLevelStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.skills.width,
                                display: 'flex',
                                textAlign: 'center',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&>.value': {
                                    width: '1.25rem'
                                },
                            },
                            [`& .${MasterServantListRowBondLevelStyleClassPrefix}-root`]: {
                                width: MasterServantColumnProperties.bondLevel.width,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&>.value': {
                                    pl: 1.5,
                                    width: '1.25rem',
                                    textAlign: 'left'
                                }
                            }
                        }
                    }
                },
                '&:not(.drag-drop-mode)': {
                    [`& .${GameServantThumbnailStyleClassPrefix}-root`]: {
                        pl: 3
                    },
                    '& .sticky-content': {
                        left: spacing(-3)
                    }
                }
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

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
        selectedServants = SetUtils.emptySet(),
        showHeader,
        sortOptions,
        visibleColumns
    } = props;

    const masterServantsSorted = useMemo((): ImmutableArray<MasterServant> => {
        if (dragDropMode) {
            return masterServants;
        }
        const sort = sortOptions?.sort;
        if (!sort) {
            return masterServants;
        }
        const direction = sortOptions.direction;
        const start = window.performance.now();
        // TODO Move this to utilities class.
        const sorted = [...masterServants].sort((a, b): number => {
            let paramA: number, paramB: number;
            switch(sort) {
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
        const end = window.performance.now();
        console.log(`Sorting by ${sort} ${direction} completed in ${(end - start).toFixed(2)}ms.`);
        return sorted;
    }, [bondLevels, dragDropMode, masterServants, sortOptions?.direction, sortOptions?.sort]);


    const {
        selectedIds,
        handleItemClick
    } = useListSelectHelper(
        masterServantsSorted,
        selectedServants,
        MasterServantUtils.getInstanceId,
        {
            disabled: dragDropMode,
            multiple: true,
            rightClickAction: 'contextmenu'
        }
    );

    useEffect(() => {
        onSelectionChange?.(selectedIds);
    }, [onSelectionChange, selectedIds]);

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

    const renderMasterServantRow = (masterServant: Immutable<MasterServant>, index: number): ReactNode => {
        const { gameId, instanceId } = masterServant;
        const gameServant = gameServantMap[gameId];
        const bondLevel = bondLevels[gameId];
        const active = selectedServants?.has(instanceId);

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
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
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
                        {masterServantsSorted.map(renderMasterServantRow)}
                    </DndProvider>
                </div>
            </div>
        </Box>
    );

    //#endregion

});
