import { Button, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { PersonAddOutlined } from '@material-ui/icons';
import React, { ReactNode, useCallback } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { DraggableListRowContainer } from '../../../../../../components/list/draggable-list-row-container.component';
import { StaticListRowContainer } from '../../../../../../components/list/static-list-row-container.component';
import { useGameServantMap } from '../../../../../../hooks/data/use-game-servant-map.hook';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { MasterServant, MasterServantBondLevel, ReadonlyPartial } from '../../../../../../types';
import { ArrayUtils } from '../../../../../../utils/array.utils';
import { MasterServantListVisibleColumns } from './master-servant-list-columns';
import { MasterServantListRow } from './master-servant-list-row.component';

type Props = {
    masterServants: MasterServant[];
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    activeServant?: MasterServant;
    editMode?: boolean;
    showAddServantRow?: boolean;
    openLinksInNewTab?: boolean;
    borderRight?: boolean;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    viewLayout?: any; // TODO Make use of this
    onActivateServant?: (servant: MasterServant) => void;
    onAddServant?: () => void;
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
};

const style = (theme: Theme) => ({
    root: {
        // minWidth: `${theme.breakpoints.width('lg')}px`,
    },
    addServantRow: {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: theme.palette.divider
    },
    addServantRowButton: {
        width: '100%',
        height: 54
    },
    addServantRowLabel: {
        display: 'flex',
        alignItems: 'center',
        fontFamily: ThemeConstants.FontFamilyRoboto,
        textTransform: 'uppercase',
        fontSize: '0.875rem',
        '& >div': {
            paddingLeft: theme.spacing(3)
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantList'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantList = React.memo((props: Props) => {
    const {
        masterServants,
        bondLevels,
        activeServant,
        editMode,
        showAddServantRow,
        openLinksInNewTab,
        borderRight,
        visibleColumns,
        onActivateServant,
        onAddServant,
        onEditServant,
        onDeleteServant
    } = props;

    const classes = useStyles();

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
        
        if (editMode) {
            return (
                <MasterServantListRow
                    key={instanceId}
                    servant={servant}
                    bond={bondLevel}
                    masterServant={masterServant}
                    onActivateServant={onActivateServant}
                    onEditServant={onEditServant}
                    onDeleteServant={onDeleteServant}
                    openLinksInNewTab={openLinksInNewTab}
                    visibleColumns={visibleColumns}
                    editMode
                />
            );
        }

        const active = activeServant?.instanceId === instanceId;
        const lastRow = index === masterServants.length - 1;

        return (
            <StaticListRowContainer
                key={instanceId}
                borderBottom={!lastRow}
                borderRight={borderRight}
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
                />
            </StaticListRowContainer>
        );
    };

    const renderAddServantRow = (): ReactNode => {
        return (
            <div className={classes.addServantRow}>
                <Button
                    className={classes.addServantRowButton}
                    color="secondary"
                    onClick={onAddServant}
                >
                    <div className={classes.addServantRowLabel}>
                        <PersonAddOutlined />
                        <div>Add servant</div>
                    </div>
                </Button>
            </div>
        );
    };

    if (!editMode) {
        return (
            <div className={classes.root}>
                {masterServants.map(renderMasterServantRow)}
                {showAddServantRow && renderAddServantRow()}
            </div>
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
                borderRight={borderRight}
                active={active}
            >
                {renderMasterServantRow(masterServant, index)}
            </DraggableListRowContainer>
        );
    };

    return (
        <div className={classes.root}>
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
        </div>
    );

});
