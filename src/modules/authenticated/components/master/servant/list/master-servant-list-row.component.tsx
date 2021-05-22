import { IconButton, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { ClassNameMap, WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import React, { ReactNode, useCallback } from 'react';
import { GameServantBondIcon } from '../../../../../../components/game/servant/game-servant-bond-icon.component';
import { AssetConstants } from '../../../../../../constants';
import { GameServant, MasterServant, MasterServantBondLevel, ReadonlyPartial } from '../../../../../../types';
import { MasterServantListColumnWidths as ColumnWidths, MasterServantListVisibleColumns } from './master-servant-list-columns';
import { MasterServantListRowLabel } from './master-servant-list-row-label.component';

type Props = {
    servant: Readonly<GameServant> | undefined; // Not optional, but possible to be undefined.
    masterServant: MasterServant;
    bond: MasterServantBondLevel | undefined;
    editMode?: boolean;
    openLinksInNewTab?: boolean;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    onActivateServant?: (servant: MasterServant) => void;
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
};

const renderNpLevel = (masterServant: MasterServant, classes: ClassNameMap): ReactNode => {
    return (
        <div className={classes.npLevel}>
            <img src={AssetConstants.ServantNoblePhantasmIconSmallUrl} alt="Noble Phantasm" />
            <div>
                {masterServant.np}
            </div>
        </div>
    );
};

const renderLevel = (masterServant: MasterServant, classes: ClassNameMap): ReactNode => {
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
};

const renderFouLevel = (masterServant: MasterServant, classes: ClassNameMap, stat: 'fouHp' | 'fouAtk'): ReactNode => {
    const value = masterServant[stat];
    return (
        <div className={classes[stat]}>
            {value === undefined ? '\u2014' : `+${value}`}
        </div>
    );
};

const renderSkillLevels = (masterServant: MasterServant, classes: ClassNameMap): ReactNode => {
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
};

const renderBondLevel = (classes: ClassNameMap, bond?: MasterServantBondLevel): ReactNode => {
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
};

const style = (theme: Theme) => ({
    root: {
        flex: 1,
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        height: '52px',
        paddingLeft: theme.spacing(4),
        fontSize: '0.875rem',
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

const useStyles = makeStyles(style, styleOptions);

export const MasterServantListRow = React.memo((props: Props) => {

    const {
        servant,
        masterServant,
        bond,
        editMode,
        openLinksInNewTab,
        visibleColumns,
        onActivateServant,
        onEditServant,
        onDeleteServant
    } = props;

    const classes = useStyles();

    const handleActivateServant = useCallback((): void => {
        onActivateServant && onActivateServant(masterServant);
    }, [masterServant, onActivateServant]);

    const handleEditServant = useCallback((): void => {
        onEditServant && onEditServant(masterServant);
    }, [masterServant, onEditServant]);

    const handleDeleteServant = useCallback((): void => {
        onDeleteServant && onDeleteServant(masterServant);
    }, [masterServant, onDeleteServant]);

    if (!servant) {
        return (
            <div className={classes.root}>
                Unknown servant ID {masterServant.gameId};
            </div>
        );
    }

    const {
        npLevel,
        level,
        fouHp,
        fouAtk,
        skillLevels,
        bondLevel,
        actions
    } = visibleColumns || {};

    const actionButtons: ReactNode = actions && (
        <div className={classes.actions}>
            <IconButton color="primary" onClick={handleEditServant}>
                <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={handleDeleteServant}>
                <DeleteIcon />
            </IconButton>
        </div>
    );

    return (
        <div 
            className={classes.root} 
            onClick={handleActivateServant}
            onDoubleClick={handleEditServant} // TODO Double-click action is temporary.
        > 
            <MasterServantListRowLabel 
                servant={servant}
                masterServant={masterServant} 
                editMode={editMode}
                openLinksInNewTab={openLinksInNewTab}
            />
                {npLevel && renderNpLevel(masterServant, classes)}
                {level && renderLevel(masterServant, classes)}
                {fouHp && renderFouLevel(masterServant, classes, 'fouHp')}
                {fouAtk && renderFouLevel(masterServant, classes, 'fouAtk')}
                {skillLevels && renderSkillLevels(masterServant, classes)}
                {bondLevel && renderBondLevel(classes, bond)}
                {actionButtons}
        </div>
    );

});
