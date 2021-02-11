import { StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { DraggableListRowContainer, StaticListRowContainer } from 'components';
import { GameServant, MasterServant } from 'data';
import { ReadonlyRecord, WithStylesProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { GameServantService } from 'services';
import { Container as Injectables } from 'typedi';
import { ArrayUtils } from 'utils';
import { MasterServantListHeader } from './master-servant-list-header.component';
import { MasterServantListRow } from './master-servant-list-row.component';

type Props = {
    masterServants: MasterServant[];
    editMode: boolean;
    viewLayout?: any; // TODO Make use of this
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
} & WithStylesProps;

const style = (theme: Theme) => ({
    root: {
        minWidth: `${theme.breakpoints.width('lg')}px`,
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantList'
};

export const MasterServantList = withStyles(style, styleOptions)(class extends PureComponent<Props> {

    private _gameServantService = Injectables.get(GameServantService);

    private _gameServantMap!: ReadonlyRecord<number, Readonly<GameServant>>;

    constructor(props: Props) {
        super(props);

        this._renderDraggable = this._renderDraggable.bind(this);
        this._renderMasterServantRow = this._renderMasterServantRow.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);
    }

    componentDidMount(): void {
        this._gameServantService.getServantsMap().then(gameServantMap => {
            this._gameServantMap = gameServantMap;
            this.forceUpdate();
        });
    }

    render(): ReactNode {
        if (!this._gameServantMap) {
            return null;
        }

        const { classes, editMode, masterServants } = this.props;

        if (!editMode) {
            return (
                <div className={classes.root}>
                    <MasterServantListHeader />
                    {masterServants.map(this._renderMasterServantRow)}
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
        const { editMode, onEditServant, onDeleteServant } = this.props;
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
                />
            </StaticListRowContainer>
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
