import { Immutable, ObjectUtils } from '@fgo-planner/common-core';
import { GameServant, ImmutableMasterServant, InstantiatedServantBondLevel, InstantiatedServantUtils } from '@fgo-planner/data-core';
import React, { DOMAttributes, MouseEvent, ReactNode, useCallback } from 'react';
import { DataTableListStaticRow } from '../../../../../../components/data-table-list/DataTableListStaticRow';
import { ServantThumbnail } from '../../../../../../components/servant/ServantThumbnail';
import { MasterServantListColumn } from './MasterServantListColumn';
import { MasterServantListRowLabel } from './MasterServantListRowLabel';
import { MasterServantListRowStats } from './MasterServantListRowStats';
import { MasterServantListRowHeight } from './MasterServantListStyle';

type Props = {
    active?: boolean;
    bond: InstantiatedServantBondLevel | undefined;
    dragDropMode?: boolean;
    gameServant: Immutable<GameServant> | undefined; // Not optional, but possible to be undefined.
    index: number;
    lastRow?: boolean;
    masterServant: ImmutableMasterServant;
    visibleColumns?: Readonly<MasterServantListColumn.Visibility>;
    onClick: (e: MouseEvent, index: number) => void;
    onContextMenu?: (e: MouseEvent, index: number) => void;
    onDoubleClick: (e: MouseEvent, index: number) => void;
    onDragOrderChange?: (sourceInstanceId: number, destinationInstanceId: number) => void;
} & Omit<DOMAttributes<HTMLDivElement>, 'onClick' | 'onContextMenu' | 'onDoubleClick'>;

const shouldSkipUpdate = (prevProps: Readonly<Props>, nextProps: Readonly<Props>): boolean => {
    if (!ObjectUtils.isShallowEquals(prevProps, nextProps)) {
        return false;
    }
    // Always re-render active servant rows.
    return !nextProps.active;
};

export const StyleClassPrefix = 'MasterServantListRow';

export const MasterServantListRow = React.memo((props: Props) => {

    const {
        active,
        bond,
        dragDropMode,
        gameServant,
        index,
        lastRow,
        masterServant,
        visibleColumns,
        onClick,
        onContextMenu,
        onDoubleClick,
        onDragOrderChange,
        ...domAttributes
    } = props;

    const handleClick = useCallback((e: MouseEvent): void => {
        onClick?.(e, index);
    }, [index, onClick]);

    const handleContextMenu = useCallback((e: MouseEvent): void => {
        onContextMenu?.(e, index);
    }, [index, onContextMenu]);

    const handleDoubleClick = useCallback((e: MouseEvent): void => {
        onDoubleClick?.(e, index);
    }, [index, onDoubleClick]);

    if (!gameServant) {
        return (
            <div className={`${StyleClassPrefix}-root`}>
                Unknown servant ID {masterServant.gameId};
            </div>
        );
    }

    const artStage = InstantiatedServantUtils.getArtStage(masterServant.ascension);

    const servantThumbnailNode: ReactNode = (
        <ServantThumbnail
            size={MasterServantListRowHeight}
            gameServant={gameServant}
            stage={artStage}
            enableLink
            openLinkInNewTab
            showOpenInNewTabIndicator
        />
    );

    const labelNode: ReactNode = (
        <MasterServantListRowLabel
            gameServant={gameServant}
        />
    );

    const statsNode: ReactNode = (
        <MasterServantListRowStats
            active={active}
            bond={bond}
            masterServant={masterServant}
            visibleColumns={visibleColumns}
        />
    );

    return (
        <DataTableListStaticRow
            styleClassPrefix={StyleClassPrefix}
            skipStyle
            // draggableId={masterServant.instanceId}
            // index={index}
            borderBottom={!lastRow}
            active={active}
            stickyContent={servantThumbnailNode}
            // dragHandleVisible={dragDropMode}
            // dragEnabled={dragDropMode}
            // onDragOrderChange={onDragOrderChange}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            {...domAttributes}
        >
            <div className={`${StyleClassPrefix}-content`}>
                {labelNode}
                {statsNode}
            </div>
        </DataTableListStaticRow>
    );

}, shouldSkipUpdate);
