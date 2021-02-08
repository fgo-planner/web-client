import { fade, IconButton, StyleRules, Theme } from '@material-ui/core';
import withStyles, { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { Delete as DeleteIcon, DragIndicator as DragIndicatorIcon, Edit as EditIcon } from '@material-ui/icons';
import { AssetConstants } from 'app-constants';
import { GameServantBondIcon } from 'components';
import { GameServant, MasterServant, MasterServantAscensionLevel, MasterServantBondLevel, MasterServantNoblePhantasmLevel } from 'data';
import { WithStylesProps } from 'internal';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { StyleUtils } from 'utils';
import { ViewModeColumnWidths } from './master-servant-list-column-widths';
import { MasterServantListRowLabel } from './master-servant-list-row-label.component';

type Props = {
    servant: Readonly<GameServant> | undefined; // Not optional, but possible to be undefined.
    masterServant: MasterServant;
    index: number;
    editMode: boolean;
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
} & WithStylesProps;

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        height: '64px',
        paddingLeft: theme.spacing(4),
        borderTop: `1px solid ${theme.palette.divider}`,
        '&.dragging': {
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        '&:hover': {
            background: fade(theme.palette.text.primary, 0.07)
        }
    },
    dragIndicator: {
        cursor: 'grab',
        margin: theme.spacing(0, 3, 0, -3),
        opacity: 0.5
    },
    noblePhantasmLevel: {
        flex: ViewModeColumnWidths.noblePhantasmLevel,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& img': {
            paddingRight: theme.spacing(1),
            width: '18px',
            height: '18px'
        }
    },
    level: {
        flex: ViewModeColumnWidths.level,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& .value': {
            width: '28px',
            textAlign: 'right',
            paddingRight: theme.spacing(4)
        },
        '& img': {
            width: '16px',
            height: '16px'
        },
        '& .ascension': {
            width: '16px'
        }
    },
    fouHp: {
        flex: ViewModeColumnWidths.fouHp
    },
    fouAtk: {
        flex: ViewModeColumnWidths.fouAtk
    },
    skillLevels: {
        flex: ViewModeColumnWidths.skillLevels,
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        '& .value': {
            width: '24px'
        },
    },
    bondLevel: {
        flex: ViewModeColumnWidths.bondLevel,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& .value': {
            paddingLeft: theme.spacing(1.5),
            width: '1.25rem',
            textAlign: 'left'
        }
    },
    actions: {
        flex: ViewModeColumnWidths.actions,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantListRow'
};

export const MasterServantListRow = withStyles(style, styleOptions)(class extends PureComponent<Props> {

    constructor(props: Props) {
        super(props);

        this._handleEditButtonClick = this._handleEditButtonClick.bind(this);
        this._handleDeleteButtonClick = this._handleDeleteButtonClick.bind(this);
    }

    render(): ReactNode {
        const { classes, masterServant, index, editMode } = this.props;
        const rowContents = this._renderRowContents();
        if (!editMode) {
            return (
                <div className={classes.root}>
                    {rowContents}
                </div>
            );
        }
        return (
            <Draggable draggableId={`draggable-servant-${masterServant.instanceId}`} index={index}>
                {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className={StyleUtils.appendClassNames(classes.root, snapshot.isDragging ? 'dragging' : undefined)}>
                        <div {...provided.dragHandleProps} className={classes.dragIndicator}>
                            <DragIndicatorIcon />
                        </div>
                        {rowContents}
                    </div>
                )}
            </Draggable>
        );
    }

    private _renderRowContents(): ReactNode {
        // TODO Clean this up
        const { classes, servant, masterServant, editMode } = this.props;
        if (!servant) {
            return `Unknown servant ID ${masterServant.gameId}`;
        }
        return (
            <Fragment>
                <MasterServantListRowLabel 
                    servant={servant}
                    masterServant={masterServant} 
                    editMode={editMode}
                />
                {this._renderNoblePhantasmLevel()}
                {this._renderLevel()}
                <div className={classes.fouHp}>
                    {masterServant.fouHp === undefined ? '\u2014' : `+${masterServant.fouHp }`}
                </div>
                <div className={classes.fouAtk}>
                    {masterServant.fouAtk === undefined ? '\u2014' : `+${masterServant.fouAtk }`}
                </div>
                {this._renderSkillLevels()}
                {this._renderBondLevel()}
                {this._renderActionButtons()}
            </Fragment>
        );
    }

    private _renderNoblePhantasmLevel(): ReactNode {
        const { masterServant, classes } = this.props;
        return (
            <div className={classes.noblePhantasmLevel}>
                <img src={AssetConstants.ServantNoblePhantasmIconSmallUrl} alt="Noble Phantasm" />
                <div>
                    {masterServant.noblePhantasmLevel}
                </div>
            </div>
        );
    }

    private _renderLevel(): ReactNode {
        const { masterServant, classes } = this.props;
        const ascensionLevel = masterServant.ascensionLevel;
        const iconUrl = ascensionLevel ? AssetConstants.ServantAscensionOnIcon : AssetConstants.ServantAscensionOffIcon;
        return (
            <div className={classes.level}>
                <div className="value">
                    {masterServant.level}
                </div>
                <img src={iconUrl} alt="Ascension" />
                <div className="ascension">
                    {masterServant.ascensionLevel}
                </div>
                {/* TODO Add grail icon */}
            </div>
        );
    }

    private _renderSkillLevels(): ReactNode {
        const { masterServant, classes } = this.props;
        return (
            <div className={classes.skillLevels}>
                <div className="value">
                    {masterServant.skillLevels[1] ?? '\u2013'}
                </div>
                /
                <div className="value">
                    {masterServant.skillLevels[2] ?? '\u2013'}
                </div>
                /
                <div className="value">
                    {masterServant.skillLevels[3] ?? '\u2013'}
                </div>
            </div>
        );
    }

    private _renderBondLevel(): ReactNode {
        const { masterServant, classes } = this.props;
        const bondLevel = masterServant.bond;
        if (bondLevel == null) {
            return (
                <div className={classes.bondLevel}>
                    {'\u2014'}
                </div>
            );
        }
        return (
            <div className={classes.bondLevel}>
                <GameServantBondIcon bond={bondLevel} size={28} />
                <div className="value">
                    {bondLevel}
                </div>
            </div>
        );
    }

    private _renderActionButtons(): ReactNode {
        const { classes } = this.props;
        return (
            <div className={classes.actions}>
                <IconButton color="primary" onClick={this._handleEditButtonClick}>
                    <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={this._handleDeleteButtonClick}>
                    <DeleteIcon />
                </IconButton>
            </div>
        );
    }

    private _handleEditButtonClick(): void {
        const { masterServant, onEditServant } = this.props;
        onEditServant && onEditServant(masterServant);
    }

    private _handleDeleteButtonClick(): void {
        const { masterServant, onDeleteServant } = this.props;
        onDeleteServant && onDeleteServant(masterServant);
    }

});
