import { StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { GameServant, MasterServant } from 'data';
import { ReadonlyRecord, WithStylesProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
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

        this._renderMasterServant = this._renderMasterServant.bind(this);
        this._handleDragEnd = this._handleDragEnd.bind(this);
    }

    componentDidMount() {
        this._gameServantService.getServantsMap().then(gameServantMap => {
            this._gameServantMap = gameServantMap;
            this.forceUpdate();
        });
    }

    render(): ReactNode {
        const { classes, editMode, masterServants } = this.props;
        return (
            <div className={classes.root}>
                <MasterServantListHeader editMode={editMode} />
                {!editMode ? masterServants.map(this._renderMasterServant) : (
                    <DragDropContext onDragEnd={this._handleDragEnd}>
                        <Droppable droppableId="droppable-servant-list">
                            {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                    {masterServants.map(this._renderMasterServant)}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </div>
        );
    }

    private _renderMasterServant(masterServant: MasterServant, index: number): ReactNode {
        const { editMode, onEditServant, onDeleteServant } = this.props;
        const servant = this._gameServantMap[masterServant.gameId];
        return (
            <MasterServantListRow
                key={masterServant.instanceId}
                servant={servant as GameServant}
                masterServant={masterServant}
                index={index}
                editMode={editMode}
                onEditServant={onEditServant}
                onDeleteServant={onDeleteServant}
            />
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