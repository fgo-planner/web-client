import { Button, StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { PersonAddOutlined } from '@material-ui/icons';
import React, { MouseEventHandler, PureComponent, ReactNode } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { DraggableListRowContainer } from '../../../../../../components/list/draggable-list-row-container.component';
import { StaticListRowContainer } from '../../../../../../components/list/static-list-row-container.component';
import { GameServantService } from '../../../../../../services/data/game/game-servant.service';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { GameServant, MasterServant, ReadonlyRecord, WithStylesProps } from '../../../../../../types';
import { ArrayUtils } from '../../../../../../utils/array.utils';
import { MasterServantListHeader } from './master-servant-list-header.component';
import { MasterServantListRow } from './master-servant-list-row.component';

type Props = {
    masterServants: MasterServant[];
    editMode?: boolean;
    showActions?: boolean;
    showAddServantRow?: boolean;
    openLinksInNewTab?: boolean;
    viewLayout?: any; // TODO Make use of this
    onAddServant?: MouseEventHandler<HTMLButtonElement>;
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
} & WithStylesProps;

const style = (theme: Theme) => ({
    root: {
        minWidth: `${theme.breakpoints.width('lg')}px`,
        marginBottom: theme.spacing(16)
    },
    addServantRow: {
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    addServantRowButton: {
        width: '100%',
        height: 64
    },
    addServantRowLabel: {
        display: 'flex',
        alignItems: 'center',
        fontFamily: ThemeConstants.FontFamilyRoboto,
        textTransform: 'uppercase',
        fontSize: '1rem',
        '& >div': {
            paddingLeft: theme.spacing(3)
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantList'
};

export const MasterServantList = withStyles(style, styleOptions)(class extends PureComponent<Props> {

    private _gameServantMap!: ReadonlyRecord<number, Readonly<GameServant>>;

    constructor(props: Props) {
        super(props);

        this._renderDraggable = this._renderDraggable.bind(this);
        this._renderMasterServantRow = this._renderMasterServantRow.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);
    }

    componentDidMount(): void {
        GameServantService.getServantsMap().then(gameServantMap => {
            this._gameServantMap = gameServantMap;
            this.forceUpdate();
        });
    }

    render(): ReactNode {
        if (!this._gameServantMap) {
            return null;
        }

        const { classes, editMode, showActions, masterServants } = this.props;

        if (!editMode) {
            return (
                <div className={classes.root}>
                    <MasterServantListHeader showActions={showActions} />
                    {masterServants.map(this._renderMasterServantRow)}
                    {this._renderAddServantRow()}
                </div>
            );
        }

        /*
         * Create a new anonymous function here instead of using a class member
         * function to force the Droppable to re-render.
         */
        const droppableRenderFunction = (provided: DroppableProvided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
                {masterServants.map(this._renderDraggable)}
                {provided.placeholder}
            </div>
        );

        return (
            <div className={classes.root}>
                <MasterServantListHeader editMode />
                <DragDropContext onDragEnd={this._handleDragEnd}>
                    <Droppable droppableId="droppable-servant-list">
                        {droppableRenderFunction}
                    </Droppable>
                </DragDropContext>
                {this._renderAddServantRow()}
            </div>
        );
    }

    private _renderDraggable(masterServant: MasterServant, index: number): ReactNode {
        const { instanceId } = masterServant;

        return (
            <DraggableListRowContainer
                key={instanceId}
                draggableId={`draggable-servant-${instanceId}`}
                index={index}
            >
                {this._renderMasterServantRow(masterServant)}
            </DraggableListRowContainer>
        );
    }

    private _renderMasterServantRow(masterServant: MasterServant): ReactNode {
        const { editMode, showActions, openLinksInNewTab, onEditServant, onDeleteServant } = this.props;
        const servant = this._gameServantMap[masterServant.gameId];
        if (editMode) {
            return (
                <MasterServantListRow
                    key={masterServant.instanceId}
                    servant={servant}
                    masterServant={masterServant}
                    onEditServant={onEditServant}
                    onDeleteServant={onDeleteServant}
                    editMode
                    showActions={showActions}
                    openLinksInNewTab={openLinksInNewTab}
                />
            );
        }
        return (
            <StaticListRowContainer key={masterServant.instanceId}>
                <MasterServantListRow
                    servant={servant}
                    masterServant={masterServant}
                    onEditServant={onEditServant}
                    onDeleteServant={onDeleteServant}
                    showActions={showActions}
                    openLinksInNewTab={openLinksInNewTab}
                />
            </StaticListRowContainer>
        );
    }

    private _renderAddServantRow(): ReactNode {
        const { classes, showAddServantRow, onAddServant } = this.props;
        if (!showAddServantRow) {
            return null;
        }
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
    }

    private _handleDragEnd(result: DropResult): void {
        if (!result.destination) {
            return;
        }
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        if (sourceIndex === destinationIndex) {
            return;
        }
        const { masterServants } = this.props;
        ArrayUtils.moveElement(masterServants, sourceIndex, destinationIndex);
    }

});
