import { GameServant, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import React, { DOMAttributes, MouseEvent, ReactNode, useCallback } from 'react';
import { GameServantBondIcon } from '../../../../../../components/game/servant/game-servant-bond-icon.component';
import { DraggableListRowContainer } from '../../../../../../components/list/draggable-list-row-container.component';
import { AssetConstants } from '../../../../../../constants';
import { Immutable, ReadonlyPartial } from '../../../../../../types/internal';
import { ObjectUtils } from '../../../../../../utils/object.utils';
import { MasterServantListVisibleColumns } from './master-servant-list-columns';
import { MasterServantListRowLabel } from './master-servant-list-row-label.component';

type Props = {
    active?: boolean;
    bond: MasterServantBondLevel | undefined;
    dragDropMode?: boolean;
    index: number;
    lastRow?: boolean;
    masterServant: MasterServant;
    servant: Immutable<GameServant> | undefined; // Not optional, but possible to be undefined.
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    onClick?: (e: MouseEvent<HTMLDivElement>, index: number) => void;
    onContextMenu?: (e: MouseEvent<HTMLDivElement>, index: number) => void;
    onDeleteServant?: (servant: MasterServant) => void;
    onDragOrderChange?: (sourceInstanceId: number, destinationInstanceId: number) => void;
    onEditServant?: (servant: MasterServant) => void;
} & Omit<DOMAttributes<HTMLDivElement>, 'onClick' | 'onContextMenu'>;

const shouldSkipUpdate = (prevProps: Readonly<Props>, nextProps: Readonly<Props>): boolean => {
    if (!ObjectUtils.isShallowEquals(prevProps, nextProps)) {
        return false;
    }
    // Always re-render active servant rows.
    return !nextProps.active;
};

export const StyleClassPrefix = 'MasterServantListRow';

const renderNpLevel = (masterServant: MasterServant): ReactNode => {
    return (
        <div className={`${StyleClassPrefix}-np-level`}>
            <img src={AssetConstants.ServantNoblePhantasmIconSmallUrl} alt='Noble Phantasm' />
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
            <div className='value'>
                {level}
            </div>
            <img src={iconUrl} alt='Ascension' />
            <div className='ascension'>
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

const renderSkillLevels = (masterServant: MasterServant, stat: 'skills' | 'appendSkills'): ReactNode => {
    const skills = masterServant[stat];
    const classNameSuffix = stat === 'appendSkills' ? 'append-skills' : 'skills';
    return (
        <div className={`${StyleClassPrefix}-${classNameSuffix}`}>
            <div className='value'>
                {skills[1] ?? '\u2013'}
            </div>
            /
            <div className='value'>
                {skills[2] ?? '\u2013'}
            </div>
            /
            <div className='value'>
                {skills[3] ?? '\u2013'}
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
            <div className='value'>
                {bond}
            </div>
        </div>
    );
};

export const MasterServantListRow = React.memo((props: Props) => {

    const {
        active,
        bond,
        dragDropMode,
        index,
        lastRow,
        masterServant,
        servant,
        visibleColumns,
        onClick,
        onContextMenu,
        onDragOrderChange,
        onEditServant,
        onDeleteServant,
        ...domAttributes
    } = props;

    const handleClick = useCallback((e: MouseEvent<HTMLDivElement>): void => {
        onClick?.(e, index);
    }, [index, onClick]);

    const handleEditServant = useCallback((): void => {
        onEditServant?.(masterServant);
    }, [masterServant, onEditServant]);

    const handleDeleteServant = useCallback((): void => {
        onDeleteServant?.(masterServant);
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
        skills,
        appendSkills,
        bondLevel,
        actions
    } = visibleColumns || {};

    const actionButtonsNode: ReactNode = actions && (
        <div className={`${StyleClassPrefix}-actions`}>
            <IconButton color='primary' onClick={handleEditServant} size='large'>
                <EditIcon />
            </IconButton>
            <IconButton color='secondary' onClick={handleDeleteServant} size='large'>
                <DeleteIcon />
            </IconButton>
        </div>
    );

    const rowContents: ReactNode = (
        <div className={`${StyleClassPrefix}-root`}>
            <MasterServantListRowLabel
                servant={servant}
                masterServant={masterServant}
                openLinksInNewTab
            />
            {npLevel && renderNpLevel(masterServant)}
            {level && renderLevel(masterServant)}
            {fouHp && renderFouLevel(masterServant, 'fouHp')}
            {fouAtk && renderFouLevel(masterServant, 'fouAtk')}
            {skills && renderSkillLevels(masterServant, 'skills')}
            {appendSkills && renderSkillLevels(masterServant, 'appendSkills')}
            {bondLevel && renderBondLevel(bond)}
            {actionButtonsNode}
        </div>
    );

    return (
        <DraggableListRowContainer
            draggableId={masterServant.instanceId}
            index={index}
            borderBottom={!lastRow}
            active={active}
            dragHandleVisible={dragDropMode}
            dragEnabled={dragDropMode}
            onDragOrderChange={onDragOrderChange}
            onClick={handleClick}
            {...domAttributes}
        >
            {rowContents}
        </DraggableListRowContainer>
    );

}, shouldSkipUpdate);
