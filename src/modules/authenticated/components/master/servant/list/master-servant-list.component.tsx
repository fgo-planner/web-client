import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { PersonAddOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode, useCallback } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { DraggableListRowContainer } from '../../../../../../components/list/draggable-list-row-container.component';
import { StaticListRowContainer } from '../../../../../../components/list/static-list-row-container.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { ReadonlyPartial } from '../../../../../../types/internal';
import { ArrayUtils } from '../../../../../../utils/array.utils';
import { MasterServantListColumnWidths as ColumnWidths, MasterServantListVisibleColumns } from './master-servant-list-columns';
import { StyleClassPrefix as MasterServantListRowLabelStyleClassPrefix } from './master-servant-list-row-label.component';
import { MasterServantListRow, StyleClassPrefix as MasterServantListRowStyleClassPrefix } from './master-servant-list-row.component';

type Props = {
    masterServants: MasterServant[];
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    activeServant?: MasterServant;
    editMode?: boolean;
    showAddServantRow?: boolean;
    openLinksInNewTab?: boolean;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    viewLayout?: any; // TODO Make use of this
    onActivateServant?: (servant: MasterServant) => void;
    onAddServant?: () => void;
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
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
        [`& .${MasterServantListRowStyleClassPrefix}-skill-levels`]: {
            flex: ColumnWidths.skillLevels,
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
            '& > :not(:first-child)': {
                pl: 4
            },
            [`& .${MasterServantListRowLabelStyleClassPrefix}-rarity`]: {
                minWidth: 24
            }
        }
    }
} as SystemStyleObject<Theme>;

export const MasterServantList = React.memo((props: Props) => {
    
    const {
        masterServants,
        bondLevels,
        activeServant,
        editMode,
        showAddServantRow,
        openLinksInNewTab,
        visibleColumns,
        onActivateServant,
        onAddServant,
        onEditServant,
        onDeleteServant
    } = props;

    const handleDragEnd = useCallback((result: DropResult): void => {
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

    const gameServantMap = useGameServantMap();
    
    if (!gameServantMap) {
        return null;
    }

    const renderMasterServantRow = (masterServant: MasterServant, index: number): ReactNode => {
        const { gameId, instanceId } = masterServant;
        const servant = gameServantMap[gameId];
        const bondLevel = bondLevels[gameId];
        const active = activeServant?.instanceId === instanceId;
        
        if (editMode) {
            return (
                <MasterServantListRow
                    key={instanceId}
                    servant={servant}
                    bond={bondLevel}
                    masterServant={masterServant}
                    onEditServant={onEditServant}
                    onDeleteServant={onDeleteServant}
                    openLinksInNewTab={openLinksInNewTab}
                    visibleColumns={visibleColumns}
                    onActivateServant={onActivateServant}
                    active={active}
                    editMode
                />
            );
        }

        const lastRow = index === masterServants.length - 1;

        return (
            <StaticListRowContainer
                key={instanceId}
                borderBottom={!lastRow}
                active={active}
            >
                <MasterServantListRow
                    servant={servant}
                    bond={bondLevel}
                    masterServant={masterServant}
                    onActivateServant={onActivateServant}
                    onEditServant={onEditServant}
                    onDeleteServant={onDeleteServant}
                    openLinksInNewTab={openLinksInNewTab}
                    visibleColumns={visibleColumns}
                    active={active}
                />
            </StaticListRowContainer>
        );
    };

    const renderAddServantRow = (): ReactNode => {
        return (
            <div className={`${StyleClassPrefix}-add-servant-row`}>
                <Button
                    className={`${StyleClassPrefix}-add-servant-row-button`}
                    color="secondary"
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

    if (!editMode) {
        return (
            <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
                {masterServants.map(renderMasterServantRow)}
                {showAddServantRow && renderAddServantRow()}
            </Box>
        );
    }

    const renderDraggable = (masterServant: MasterServant, index: number): ReactNode => {
        const { instanceId } = masterServant;
        
        const active = activeServant?.instanceId === instanceId;
        const lastRow = index === masterServants.length - 1;

        return (
            <DraggableListRowContainer
                key={instanceId}
                draggableId={`draggable-servant-${instanceId}`}
                index={index}
                borderBottom={!lastRow}
                active={active}
            >
                {renderMasterServantRow(masterServant, index)}
            </DraggableListRowContainer>
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="droppable-servant-list">
                    {(provided: DroppableProvided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {masterServants.map(renderDraggable)}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            {showAddServantRow && renderAddServantRow()}
        </Box>
    );

});
