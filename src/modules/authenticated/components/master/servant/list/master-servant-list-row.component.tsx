import { GameServant, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { IconButton, Theme } from '@mui/material';
import { StyleRules, ClassNameMap, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import React, { ReactNode, useCallback } from 'react';
import { GameServantBondIcon } from '../../../../../../components/game/servant/game-servant-bond-icon.component';
import { AssetConstants } from '../../../../../../constants';
import { ReadonlyPartial } from '../../../../../../types/internal';
import { ObjectUtils } from '../../../../../../utils/object.utils';
import { MasterServantListColumnWidths as ColumnWidths, MasterServantListVisibleColumns } from './master-servant-list-columns';
import { MasterServantListRowLabel } from './master-servant-list-row-label.component';

type Props = {
    servant: Readonly<GameServant> | undefined; // Not optional, but possible to be undefined.
    masterServant: MasterServant;
    bond: MasterServantBondLevel | undefined;
    active?: boolean;
    editMode?: boolean;
    openLinksInNewTab?: boolean;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    onActivateServant?: (servant: MasterServant) => void;
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
};

const shouldSkipUpdate = (prevProps: Readonly<Props>, nextProps: Readonly<Props>): boolean => {
    if (!ObjectUtils.isShallowEquals(prevProps, nextProps)) {
        return false;
    }
    return !nextProps.active;
};

const renderNpLevel = (classes: ClassNameMap, masterServant: MasterServant): ReactNode => {
    return (
        <div className={classes.npLevel}>
            <img src={AssetConstants.ServantNoblePhantasmIconSmallUrl} alt="Noble Phantasm" />
            <div>
                {masterServant.np}
            </div>
        </div>
    );
};

const renderLevel = (classes: ClassNameMap, masterServant: MasterServant): ReactNode => {
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

const renderFouLevel = (classes: ClassNameMap, masterServant: MasterServant, stat: 'fouHp' | 'fouAtk'): ReactNode => {
    const value = masterServant[stat];
    return (
        <div className={classes[stat]}>
            {value === undefined ? '\u2014' : `+${value}`}
        </div>
    );
};

const renderSkillLevels = (classes: ClassNameMap, masterServant: MasterServant): ReactNode => {
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
            <IconButton color="primary" onClick={handleEditServant} size="large">
                <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={handleDeleteServant} size="large">
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
                {npLevel && renderNpLevel(classes, masterServant)}
                {level && renderLevel(classes, masterServant)}
                {fouHp && renderFouLevel(classes, masterServant, 'fouHp')}
                {fouAtk && renderFouLevel(classes, masterServant, 'fouAtk')}
                {skillLevels && renderSkillLevels(classes, masterServant)}
                {bondLevel && renderBondLevel(classes, bond)}
                {actionButtons}
        </div>
    );

}, shouldSkipUpdate);
