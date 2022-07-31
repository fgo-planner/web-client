import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, ReactNode, useEffect, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { StyleClassPrefix as GameServantThumbnailStyleClassPrefix } from '../../../../../../components/game/servant/game-servant-thumbnail.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { Immutable, ImmutableArray, ReadonlyPartial } from '../../../../../../types/internal';
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
    dragDropMasterServants?: Array<Immutable<MasterServant>>;
    dragDropMode?: boolean;
    masterServants: ImmutableArray<MasterServant>;
    /**
     * Instance IDs of selected servants.
     */
    selectedServants?: ReadonlySet<number>;
    showHeader?: boolean;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    viewLayout?: any; // TODO Make use of this
    onEditSelectedServants?: () => void;
    onDeleteSelectedServants?: () => void;
    onDragOrderChange?: (sourceInstanceId: number, destinationInstanceId: number) => void;
    onServantClick?: (e: MouseEvent<HTMLDivElement>, index: number) => void;
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
                                minWidth: spacing(7),  // 28px
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
        dragDropMasterServants,
        dragDropMode,
        masterServants,
        onEditSelectedServants,
        onDeleteSelectedServants,
        onDragOrderChange,
        onServantClick,
        selectedServants,
        showHeader,
        visibleColumns
    } = props;

    /**
     * Stores the `masterServants` set as a ref to prevent `handleServantClick` from
     * being redefined when the object reference changes.
     */
    const masterServantsRef = useRef<ImmutableArray<MasterServant>>(masterServants);

    /**
     * Stores the `selectedServants` set as a ref to prevent `handleServantClick`
     * from being redefined when the object reference changes.
     */
    const selectedServantsRef = useRef<ReadonlySet<number>>();

    /**
     * Updates the `masterServantsRef` and `selectedServantsRef` whenever their
     * respective source data changes.
     */
    useEffect(() => {
        masterServantsRef.current = masterServants;
        selectedServantsRef.current = selectedServants;
    }, [masterServants, selectedServants]);

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
                onClick={onServantClick}
                onDoubleClick={onEditSelectedServants}
                onContextMenu={onServantClick}
            />
        );
    };

    const masterServantsSource = dragDropMasterServants || masterServants;

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-list-container`}>
                {showHeader && <MasterServantListHeader
                    visibleColumns={visibleColumns}
                    dragDropMode={dragDropMode}
                />}
                <div className={clsx(`${StyleClassPrefix}-list`, dragDropMode && 'drag-drop-mode')}>
                    <DndProvider backend={HTML5Backend}>
                        {masterServantsSource.map(renderMasterServantRow)}
                    </DndProvider>
                </div>
            </div>
        </Box>
    );

    //#endregion

});
