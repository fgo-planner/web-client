import { IconButton, StyleRules, Theme } from '@material-ui/core';
import withStyles, { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import { PureComponent, ReactNode } from 'react';
import { GameServantBondIcon } from '../../../../../../components/game/servant/game-servant-bond-icon.component';
import { AssetConstants } from '../../../../../../constants';
import { GameServant, MasterServant, MasterServantBondLevel, ReadonlyPartial, WithStylesProps } from '../../../../../../types';
import { MasterServantListColumnWidths as ColumnWidths, MasterServantListVisibleColumns } from './master-servant-list-columns';
import { MasterServantListRowLabel } from './master-servant-list-row-label.component';

type Props = {
    servant: Readonly<GameServant> | undefined; // Not optional, but possible to be undefined.
    masterServant: MasterServant;
    bond: MasterServantBondLevel | undefined;
    editMode?: boolean;
    openLinksInNewTab?: boolean;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
} & WithStylesProps;

const style = (theme: Theme) => ({
    root: {
        flex: 1,
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        height: '52px',
        paddingLeft: theme.spacing(4),
        fontSize: '0.875rem'
    },
    npLevel: {
        flex: ColumnWidths.npLevel,
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
        flex: ColumnWidths.level,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& .value': {
            width: '28px',
            textAlign: 'right',
            paddingRight: theme.spacing(3)
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
        flex: ColumnWidths.fouHp
    },
    fouAtk: {
        flex: ColumnWidths.fouAtk
    },
    skillLevels: {
        flex: ColumnWidths.skillLevels,
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        '& .value': {
            width: '1.25rem'
        },
    },
    bondLevel: {
        flex: ColumnWidths.bondLevel,
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
        width: ColumnWidths.actions,
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
        const {
            classes,
            servant,
            masterServant,
            editMode,
            openLinksInNewTab,
            visibleColumns
        } = this.props;

        const {
            npLevel,
            level,
            fouHp,
            fouAtk,
            skillLevels,
            bondLevel,
            actions
        } = visibleColumns || {};

        if (!servant) {
            return (
                <div className={classes.root}>
                    Unknown servant ID {masterServant.gameId};
                </div>
            );
        }
        return (
            <div className={classes.root}>
                <MasterServantListRowLabel 
                    servant={servant}
                    masterServant={masterServant} 
                    editMode={editMode}
                    openLinksInNewTab={openLinksInNewTab}
                />
                {npLevel && this._renderNpLevel()}
                {level && this._renderLevel()}
                {fouHp && this._renderFouLevel('fouHp')}
                {fouAtk && this._renderFouLevel('fouAtk')}
                {skillLevels && this._renderSkillLevels()}
                {bondLevel && this._renderBondLevel()}
                {actions && this._renderActionButtons()}
            </div>
        );
    }

    private _renderNpLevel(): ReactNode {
        const { masterServant, classes } = this.props;
        return (
            <div className={classes.npLevel}>
                <img src={AssetConstants.ServantNoblePhantasmIconSmallUrl} alt="Noble Phantasm" />
                <div>
                    {masterServant.np}
                </div>
            </div>
        );
    }

    private _renderLevel(): ReactNode {
        const { masterServant, classes } = this.props;
        const { ascension, level } = masterServant;
        const iconUrl = ascension ? AssetConstants.ServantAscensionOnIcon : AssetConstants.ServantAscensionOffIcon;
        return (
            <div className={classes.level}>
                <div className="value">
                    {level}
                </div>
                <img src={iconUrl} alt="Ascension" />
                <div className="ascension">
                    {ascension}
                </div>
                {/* TODO Add grail icon */}
            </div>
        );
    }

    private _renderFouLevel(stat: 'fouHp' | 'fouAtk'): ReactNode {
        const { masterServant, classes } = this.props;
        const value = masterServant[stat];
        return (
            <div className={classes[stat]}>
                {value === undefined ? '\u2014' : `+${value}`}
            </div>
        );
    }

    private _renderSkillLevels(): ReactNode {
        const { masterServant, classes } = this.props;
        return (
            <div className={classes.skillLevels}>
                <div className="value">
                    {masterServant.skills[1] ?? '\u2013'}
                </div>
                /
                <div className="value">
                    {masterServant.skills[2] ?? '\u2013'}
                </div>
                /
                <div className="value">
                    {masterServant.skills[3] ?? '\u2013'}
                </div>
            </div>
        );
    }

    private _renderBondLevel(): ReactNode {
        const { bond, classes } = this.props;
        if (bond == null) {
            return (
                <div className={classes.bondLevel}>
                    {'\u2014'}
                </div>
            );
        }
        return (
            <div className={classes.bondLevel}>
                <GameServantBondIcon bond={bond} size={28} />
                <div className="value">
                    {bond}
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
