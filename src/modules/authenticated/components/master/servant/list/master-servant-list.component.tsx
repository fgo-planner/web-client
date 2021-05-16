import { Button, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { PersonAddOutlined } from '@material-ui/icons';
import React, { MouseEventHandler, ReactNode, useCallback } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { DraggableListRowContainer } from '../../../../../../components/list/draggable-list-row-container.component';
import { StaticListRowContainer } from '../../../../../../components/list/static-list-row-container.component';
import { GameServantMap } from '../../../../../../services/data/game/game-servant.service';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { MasterServant, MasterServantBondLevel, ReadonlyPartial } from '../../../../../../types';
import { ArrayUtils } from '../../../../../../utils/array.utils';
import { MasterServantListVisibleColumns } from './master-servant-list-columns';
import { MasterServantListRow } from './master-servant-list-row.component';

type Props = {
    gameServantMap: GameServantMap,
    masterServants: MasterServant[];
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    editMode?: boolean;
    showAddServantRow?: boolean;
    openLinksInNewTab?: boolean;
    borderRight?: boolean;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    viewLayout?: any; // TODO Make use of this
    onAddServant?: MouseEventHandler<HTMLButtonElement>;
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
        gameServantMap,
        masterServants,
        bondLevels,
        editMode,
        showAddServantRow,
        openLinksInNewTab,
        borderRight,
        visibleColumns,
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

    const renderMasterServantRow = (masterServant: MasterServant, index: number): ReactNode => {
        const servantId = masterServant.gameId;
        const servant = gameServantMap[servantId];
        const bondLevel = bondLevels[servantId];
        const lastRow = index === masterServants.length - 1;

        if (editMode) {
            return (
                <MasterServantListRow
                    key={masterServant.instanceId}
                    servant={servant}
                    bond={bondLevel}
                    masterServant={masterServant}
                    onEditServant={onEditServant}
                    onDeleteServant={onDeleteServant}
                    editMode
                    openLinksInNewTab={openLinksInNewTab}
                    visibleColumns={visibleColumns}
                />
            );
        }

        return (
            <StaticListRowContainer
                key={masterServant.instanceId}
                borderBottom={!lastRow}
                borderRight={borderRight}
            >
                <MasterServantListRow
                    servant={servant}
                    bond={bondLevel}
                    masterServant={masterServant}
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

        const lastRow = index === masterServants.length - 1;

        return (
            <DraggableListRowContainer
                key={instanceId}
                draggableId={`draggable-servant-${instanceId}`}
                index={index}
                borderBottom={!lastRow}
                borderRight={borderRight}
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
