import { GameServant, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import React, { ReactNode, useCallback } from 'react';
import { GameServantBondIcon } from '../../../../../../components/game/servant/game-servant-bond-icon.component';
import { AssetConstants } from '../../../../../../constants';
import { ReadonlyPartial } from '../../../../../../types/internal';
import { ObjectUtils } from '../../../../../../utils/object.utils';
import { MasterServantListVisibleColumns } from './master-servant-list-columns';
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

export const StyleClassPrefix = 'MasterServantListRow';

const renderNpLevel = (masterServant: MasterServant): ReactNode => {
    return (
        <div className={`${StyleClassPrefix}-np-level`}>
            <img src={AssetConstants.ServantNoblePhantasmIconSmallUrl} alt="Noble Phantasm" />
            <div>
                {masterServant.np}
            </div>
        </div>
    );
};

const renderLevel = (masterServant: MasterServant): ReactNode => {
    const { ascension, level } = masterServant;
    const iconUrl = ascension ? AssetConstants.ServantAscensionOnIcon : AssetConstants.ServantAscensionOffIcon;
    return (
        <div className={`${StyleClassPrefix}-level`}>
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

const renderFouLevel = (masterServant: MasterServant, stat: 'fouHp' | 'fouAtk'): ReactNode => {
    const value = masterServant[stat];
    return (
        <div className={`${StyleClassPrefix}-${stat === 'fouHp' ? 'fou-hp' : 'fou-atk'}`}>
            {value === undefined ? '\u2014' : `+${value}`}
        </div>
    );
};

const renderSkillLevels = (masterServant: MasterServant): ReactNode => {
    return (
        <div className={`${StyleClassPrefix}-skill-levels`}>
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

const renderBondLevel = (bond?: MasterServantBondLevel): ReactNode => {
    if (bond == null) {
        return (
            <div className={`${StyleClassPrefix}-bond-level`}>
                {'\u2014'}
            </div>
        );
    }
    return (
        <div className={`${StyleClassPrefix}-bond-level`}>
            <GameServantBondIcon bond={bond} size={28} />
            <div className="value">
                {bond}
            </div>
        </div>
    );
};

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
            <div className={`${StyleClassPrefix}-root`}>
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

    const actionButtonsNode: ReactNode = actions && (
        <div className={`${StyleClassPrefix}-actions`}>
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
            className={`${StyleClassPrefix}-root`} 
            onClick={handleActivateServant}
            onDoubleClick={handleEditServant} // TODO Double-click action is temporary.
        > 
            <MasterServantListRowLabel 
                servant={servant}
                masterServant={masterServant} 
                editMode={editMode}
                openLinksInNewTab={openLinksInNewTab}
            />
                {npLevel && renderNpLevel(masterServant)}
                {level && renderLevel(masterServant)}
                {fouHp && renderFouLevel(masterServant, 'fouHp')}
                {fouAtk && renderFouLevel(masterServant, 'fouAtk')}
                {skillLevels && renderSkillLevels(masterServant)}
                {bondLevel && renderBondLevel(bond)}
                {actionButtonsNode}
        </div>
    );

}, shouldSkipUpdate);
