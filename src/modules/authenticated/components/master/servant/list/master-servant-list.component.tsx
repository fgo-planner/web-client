import { Button, StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { PersonAddOutlined } from '@material-ui/icons';
import { MouseEventHandler, PureComponent, ReactNode } from 'react';
import { DragDropContext, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import { DraggableListRowContainer } from '../../../../../../components/list/draggable-list-row-container.component';
import { StaticListRowContainer } from '../../../../../../components/list/static-list-row-container.component';
import { GameServantService } from '../../../../../../services/data/game/game-servant.service';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { GameServant, MasterServant, MasterServantBondLevel, ReadonlyRecord, WithStylesProps } from '../../../../../../types';
import { ArrayUtils } from '../../../../../../utils/array.utils';
import { MasterServantListRow } from './master-servant-list-row.component';

type Props = {
    masterServants: MasterServant[];
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    editMode?: boolean;
    showActions?: boolean;
    showAddServantRow?: boolean;
    borderRight?: boolean;
    openLinksInNewTab?: boolean;
    viewLayout?: any; // TODO Make use of this
    onAddServant?: MouseEventHandler<HTMLButtonElement>;
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
} & WithStylesProps;

const style = (theme: Theme) => ({
    root: {
        minWidth: `${theme.breakpoints.width('lg')}px`,
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

        const { classes, editMode, masterServants } = this.props;

        if (!editMode) {
            return (
                <div className={classes.root}>
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
        const { masterServants, borderRight } = this.props;
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
                {this._renderMasterServantRow(masterServant, index)}
            </DraggableListRowContainer>
        );
    }

    private _renderMasterServantRow(masterServant: MasterServant, index: number): ReactNode {
        const {
            masterServants,
            bondLevels,
            editMode,
            showActions,
            openLinksInNewTab,
            borderRight,
            onEditServant,
            onDeleteServant
        } = this.props;

        const servantId = masterServant.gameId;
        const servant = this._gameServantMap[servantId];
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
                    showActions={showActions}
                    openLinksInNewTab={openLinksInNewTab}
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
