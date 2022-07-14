import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, ReactNode, useCallback, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StyleClassPrefix as GameServantThumbnailStyleClassPrefix } from '../../../../../../components/game/servant/game-servant-thumbnail.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
import { ReadonlyPartial } from '../../../../../../types/internal';
import { ArrayUtils } from '../../../../../../utils/array.utils';
import { MasterServantListColumnWidths as ColumnWidths, MasterServantListVisibleColumns } from './master-servant-list-columns';
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
    dragDropMode?: boolean;
    masterServants: Array<MasterServant>;
    /**
     * Instance IDs of selected servants.
     */
    selectedServants?: ReadonlySet<number>;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    viewLayout?: any; // TODO Make use of this
    onEditSelectedServants?: () => void;
    onEditServant?: (servant: MasterServant) => void;
    onDeleteSelectedServants?: () => void;
    onDeleteServant?: (servant: MasterServant) => void;
    onServantContextMenu?: (e: MouseEvent<HTMLDivElement>) => void;
    onServantSelectionChange?: (instanceIds: Array<number>) => void;
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
                            width: ColumnWidths.label,
                            [`& .${MasterServantListRowLabelStyleClassPrefix}-class-icon`]: {
                                pl: 4
                            },
                            [`& .${MasterServantListRowLabelStyleClassPrefix}-rarity`]: {
                                minWidth: 24,
                                px: 4
                            }
                        },
                        [`& .${MasterServantListRowStatsStyleClassPrefix}-root`]: {
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            [`& .${MasterServantListRowNpLevelStyleClassPrefix}-root`]: {
                                width: ColumnWidths.stats.npLevel,
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
                                width: ColumnWidths.stats.level,
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
                                width: ColumnWidths.stats.fou
                            },
                            [`& .${MasterServantListRowSkillLevelStyleClassPrefix}-root`]: {
                                width: ColumnWidths.stats.skills,
                                display: 'flex',
                                textAlign: 'center',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&>.value': {
                                    width: '1.25rem'
                                },
                            },
                            [`& .${MasterServantListRowBondLevelStyleClassPrefix}-root`]: {
                                width: ColumnWidths.stats.bondLevel,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&>.value': {
                                    pl: 1.5,
                                    width: '1.25rem',
                                    textAlign: 'left'
                                }
                            }
                        },
                        [`& .${MasterServantListRowStyleClassPrefix}-actions`]: {
                            width: ColumnWidths.actions,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
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

    const forceUpdate = useForceUpdate();

    const gameServantMap = useGameServantMap();

    const {
        masterServants,
        bondLevels,
        selectedServants,
        dragDropMode,
        visibleColumns,
        onEditSelectedServants,
        onEditServant,
        onDeleteSelectedServants,
        onDeleteServant,
        onServantContextMenu,
        onServantSelectionChange
    } = props;

    const lastClickIndexRef = useRef<number>();

    /**
     * Stores the `masterServants` set as a ref to prevent `handleServantClick` from
     * being redefined when the object reference changes.
     */
    const masterServantsRef = useRef<Array<MasterServant>>(masterServants);

    /**
     * Stores the `selectedServants` set as a ref to prevent `handleServantClick`
     * from being redefined when the object reference changes.
     */
    const selectedServantsRef = useRef<ReadonlySet<number>>();

    useEffect(() => {
        masterServantsRef.current = masterServants;
    }, [masterServants]);

    useEffect(() => {
        selectedServantsRef.current = selectedServants;
    }, [selectedServants]);

    /*
     * Adds a listener to invoke the `onDeleteSelectedServants` callback when the
     * delete key is pressed.
     */
    useEffect(() => {
        if (!onDeleteSelectedServants) {
            return;
        }
        const listener = (event: KeyboardEvent): void => {
            if (event.key !== 'Delete') {
                return;
            }
            onDeleteSelectedServants();
        };
        window.addEventListener('keydown', listener);
        return () => window.removeEventListener('keydown', listener);
    }, [onDeleteSelectedServants]);


    //#region Event handlers

    /**
     * Handles both the left click (onClick) and right (onContextmenu) events from
     * the servant row.
     */
    const handleServantClick = useCallback((e: MouseEvent<HTMLDivElement>, index: number): void => {
        if (!onServantSelectionChange) {
            return;
        }

        /*
         * Whether the right mouse button (contextmenu) was clicked.
         */
        const isRightClick = e.type === 'contextmenu';

        const masterServants = masterServantsRef.current;
        const selectedServants = selectedServantsRef.current;

        /**
         * The instance ID of the servant that was clicked.
         */
        const clickedInstanceId = masterServants[index].instanceId;

        /**
         * Array containing the instance IDs of the updated selection.
         */
        const updatedSelection: number[] = [];

        if (e.shiftKey) {
            /*
             * If the shift modifier key was pressed, then do one of the following:
             * 
             * - If a previous click index was recorded, then all all the servants between
             *   that index and the newly clicked index (inclusive) regardless of whether
             *   they were already selected or not.
             * 
             * - If a previous click was not recorded, then change the selection to just the
             *   servant that was clicked (same behavior as no modifier keys).
             *
             * Note that if both the shift and ctrl keys were pressed, then the shift key
             * has precedence.
             */
            const lastClickIndex = lastClickIndexRef.current;
            if (lastClickIndex === undefined) {
                updatedSelection.push(clickedInstanceId);
            } else {
                if (selectedServants) {
                    updatedSelection.push(...selectedServants);
                }
                if (lastClickIndex === index) {
                    updatedSelection.push(clickedInstanceId);
                } else {
                    const start = Math.min(lastClickIndex, index);
                    const end = Math.max(lastClickIndex, index);
                    for (let i = start; i <= end; i++) {
                        const { instanceId } = masterServants[i];
                        updatedSelection.push(instanceId);
                    }
                }
            }
        } else if (e.ctrlKey) {
            /*
             * If the ctrl modifier key was pressed, then do one of the following:
             *
             * - If the clicked servant was already selected, then deselect it.
             *
             * - If the clicked servant was not selected, then add it to the selection.
             */
            let alreadySelected = false;
            if (selectedServants) {
                for (const instanceId of selectedServants) {
                    if (instanceId === clickedInstanceId) {
                        alreadySelected = true;
                    } else {
                        updatedSelection.push(instanceId);
                    }
                }
            }
            if (!alreadySelected) {
                updatedSelection.push(clickedInstanceId);
            }
        } else if (isRightClick && selectedServants?.has(clickedInstanceId)) {
            /**
             * If the right button was clicked, and the clicked servant was already
             * selected, then dont modify the selection. We want the context menu to apply
             * to the current select.
             */
            updatedSelection.push(...selectedServants);
        } else {
            /*
             * If no modifier keys were pressed, then change the selection to just the
             * servant that was clicked.
             */
            updatedSelection.push(clickedInstanceId);
        }

        /*
         * Notify parent component of the selection change.
         */
        onServantSelectionChange(updatedSelection);

        /*
         * Update the last clicked row/servant index.
         */
        lastClickIndexRef.current = index;

        /*
         * If the right button was clicked, then also notify the parent to open the
         * context menu.
         */
        if (isRightClick) {
            e.preventDefault();
            onServantContextMenu?.(e);
        }

    }, [onServantContextMenu, onServantSelectionChange]);

    const onDragOrderChange = useCallback((sourceInstanceId: number, destinationInstanceId: number): void => {
        console.log(sourceInstanceId, destinationInstanceId);
        if (sourceInstanceId === destinationInstanceId) {
            return;
        }
        const sourceIndex = masterServants.findIndex(s => s.instanceId === sourceInstanceId);
        const destinationIndex = masterServants.findIndex(s => s.instanceId === destinationInstanceId);
        ArrayUtils.moveElement(masterServants, sourceIndex, destinationIndex);
        forceUpdate();
    }, [forceUpdate, masterServants]);

    //#endregion


    //#region Component rendering

    /**
     * This can be undefined during the initial render.
     */
    if (!gameServantMap) {
        return null;
    }

    const renderMasterServantRow = (masterServant: MasterServant, index: number): ReactNode => {
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
                onEditServant={onEditServant}
                onDeleteServant={onDeleteServant}
                visibleColumns={visibleColumns}
                active={active}
                dragDropMode={dragDropMode}
                onDragOrderChange={onDragOrderChange}
                onClick={handleServantClick}
                onDoubleClick={onEditSelectedServants}
                onContextMenu={handleServantClick}
            />
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-list-container`}>
                <MasterServantListHeader
                    visibleColumns={visibleColumns}
                    dragDropMode={dragDropMode}
                />
                <div className={clsx(`${StyleClassPrefix}-list`, dragDropMode && 'drag-drop-mode')}>
                    <DndProvider backend={HTML5Backend}>
                        {masterServants.map(renderMasterServantRow)}
                    </DndProvider>
                </div>
            </div>
        </Box>
    );

    //#endregion

});
