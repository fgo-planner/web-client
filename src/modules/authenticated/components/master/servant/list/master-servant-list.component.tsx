import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { PersonAddOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { MouseEvent, ReactNode, useCallback, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { ReadonlyPartial } from '../../../../../../types/internal';
import { ArrayUtils } from '../../../../../../utils/array.utils';
import { MasterServantListColumnWidths as ColumnWidths, MasterServantListVisibleColumns } from './master-servant-list-columns';
import { StyleClassPrefix as MasterServantListRowLabelStyleClassPrefix } from './master-servant-list-row-label.component';
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
    onAddServant?: () => void;
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
    onServantSelectionChange?: (instanceIds: Array<number>) => void;
};

const StyleClassPrefix = 'MasterServantList';

const StyleProps = {
    [`& .${StyleClassPrefix}-add-servant-row`]: {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: 'divider'
    },
    [`& .${StyleClassPrefix}-add-servant-row-button`]: {
        width: '100%',
        height: 54
    },
    [`& .${StyleClassPrefix}-add-servant-row-label`]: {
        display: 'flex',
        alignItems: 'center',
        fontFamily: ThemeConstants.FontFamilyRoboto,
        textTransform: 'uppercase',
        fontSize: '0.875rem',
        '& >div': {
            pl: 3
        }
    },
    [`& .${MasterServantListRowStyleClassPrefix}-root`]: {
        flex: 1,
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        height: 52,
        pl: 4,
        fontSize: '0.875rem',
        [`& .${MasterServantListRowStyleClassPrefix}-np-level`]: {
            flex: ColumnWidths.npLevel,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& img': {
                pr: 1,
                width: '18px',
                height: '18px'
            }
        },
        [`& .${MasterServantListRowStyleClassPrefix}-level`]: {
            flex: ColumnWidths.level,
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
        [`& .${MasterServantListRowStyleClassPrefix}-fou-hp`]: {
            flex: ColumnWidths.fouHp
        },
        [`& .${MasterServantListRowStyleClassPrefix}-fou-atk`]: {
            flex: ColumnWidths.fouAtk
        },
        [`& .${MasterServantListRowStyleClassPrefix}-skills`]: {
            flex: ColumnWidths.skills,
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            '&>.value': {
                width: '1.25rem'
            },
        },
        [`& .${MasterServantListRowStyleClassPrefix}-append-skills`]: {
            flex: ColumnWidths.appendSkills,
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            '&>.value': {
                width: '1.25rem'
            },
        },
        [`& .${MasterServantListRowStyleClassPrefix}-bond-level`]: {
            flex: ColumnWidths.bondLevel,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&>.value': {
                pl: 1.5,
                width: '1.25rem',
                textAlign: 'left'
            }
        },
        [`& .${MasterServantListRowStyleClassPrefix}-actions`]: {
            width: ColumnWidths.actions,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        [`& .${MasterServantListRowLabelStyleClassPrefix}-root`]: {
            display: 'flex',
            alignItems: 'center',
            flex: ColumnWidths.label,
            /**
             * This fixes text truncation issues inside flex box.
             * @see https://css-tricks.com/flexbox-truncated-text/
             */
            minWidth: 0,
            '& >div': {
                pl: 4
            },
            [`& .${MasterServantListRowLabelStyleClassPrefix}-rarity`]: {
                minWidth: 24
            }
        }
    }
} as SystemStyleObject<Theme>;

export const MasterServantList = React.memo((props: Props) => {
    
    const gameServantMap = useGameServantMap();

    const {
        masterServants,
        bondLevels,
        selectedServants,
        dragDropMode,
        visibleColumns,
        onAddServant,
        onEditServant,
        onDeleteServant,
        onServantSelectionChange
    } = props;

    const lastClickIndexRef = useRef<number>();

    /**
     * Stores the `masterServants` set internally to prevent `handleServantClick`
     * from being redefined when the object reference changes.
     */
    const masterServantsRef = useRef<Array<MasterServant>>(masterServants);

    /**
     * Stores the `selectedServants` set internally to prevent `handleServantClick`
     * from being redefined when the object reference changes.
     */
    const selectedServantsRef = useRef<ReadonlySet<number>>();

    useEffect(() => {
        masterServantsRef.current = masterServants;
    }, [masterServants]);

    useEffect(() => {
        selectedServantsRef.current = selectedServants;
    }, [selectedServants]);

    const handleServantClick = useCallback((e: MouseEvent<HTMLDivElement>, index: number): void => {
        if (!onServantSelectionChange) {
            return;
        }
        
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

    }, [onServantSelectionChange]);

    const handleServantDragEnd = useCallback((result: DropResult): void => {
        if (!result.destination) {
            return;
        }
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        if (sourceIndex === destinationIndex) {
            return;
        }
        ArrayUtils.moveElement(masterServants, sourceIndex, destinationIndex);
    }, [masterServants]);
    
    /**
     * This can be undefined during the initial render.
     */
    if (!gameServantMap) {
        return null;
    }

    const renderMasterServantRow = (masterServant: MasterServant, index: number): ReactNode => {
        const { gameId, instanceId } = masterServant;
        const servant = gameServantMap[gameId];
        const bondLevel = bondLevels[gameId];
        const active = selectedServants?.has(instanceId);
        
        return (
            <MasterServantListRow
                key={instanceId}
                index={index}
                servant={servant}
                bond={bondLevel}
                masterServant={masterServant}
                onEditServant={onEditServant}
                onDeleteServant={onDeleteServant}
                visibleColumns={visibleColumns}
                active={active}
                dragDropMode={dragDropMode}
                onClick={handleServantClick}
                // TODO Add right click (context) handler
            />
        );
    };

    const renderAddServantRow = (): ReactNode => {
        return (
            <div className={`${StyleClassPrefix}-add-servant-row`}>
                <Button
                    className={`${StyleClassPrefix}-add-servant-row-button`}
                    color='secondary'
                    onClick={onAddServant}
                >
                    <div className={`${StyleClassPrefix}-add-servant-row-label`}>
                        <PersonAddOutlined />
                        <div>Add servant</div>
                    </div>
                </Button>
            </div>
        );
    };

    // if (!editMode) {
    //     return (
    //         <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
    //             {masterServants.map(renderMasterServantRow)}
    //             {showAddServantRow && renderAddServantRow()}
    //         </Box>
    //     );
    // }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <DragDropContext onDragEnd={handleServantDragEnd}>
                <Droppable droppableId='droppable-servant-list' isDropDisabled={!dragDropMode}>
                    {(provided: DroppableProvided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {masterServants.map(renderMasterServantRow)}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </Box>
    );

});
