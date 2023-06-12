import { Immutable, ObjectUtils } from '@fgo-planner/common-core';
import { GameServant, ImmutableMasterServant, InstantiatedServantBondLevel, InstantiatedServantUtils } from '@fgo-planner/data-core';
import React, { DOMAttributes, DragEvent, DragEventHandler, MouseEvent, ReactNode, useCallback, useMemo } from 'react';
import { DataTableListRow } from '../../../../../../components/data-table-list/DataTableListRow';
import { DataTableDragHandle } from '../../../../../../components/data-table/DataTableDragHandle';
import { ServantThumbnail } from '../../../../../../components/servant/ServantThumbnail';
import { MasterServantListColumn } from './MasterServantListColumn';
import { MasterServantListRowLabel } from './MasterServantListRowLabel';
import { MasterServantListRowStats } from './MasterServantListRowStats';
import { MasterServantListRowHeight } from './MasterServantListStyle';

type Props = {
    active?: boolean;
    bond: InstantiatedServantBondLevel | undefined;
    disablePointerEvents?: boolean;
    dragDropMode?: boolean;
    gameServant: Immutable<GameServant> | undefined; // Not optional, but possible to be undefined.
    hideStatColumns?: boolean;
    idPrefix?: string;
    index: number;
    lastRow?: boolean;
    masterServant: ImmutableMasterServant;
    visibleColumns: Readonly<MasterServantListColumn.Visibility>;
    onClick: (event: MouseEvent, index: number) => void;
    onContextMenu?: (event: MouseEvent, index: number) => void;
    onDoubleClick: (event: MouseEvent, index: number) => void;
    onDragStart?: (event: DragEvent, instanceId: number) => void;
} & Omit<DOMAttributes<HTMLDivElement>, 'onClick' | 'onContextMenu' | 'onDoubleClick' | 'onDragStart'>;

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
        disablePointerEvents,
        dragDropMode,
        gameServant,
        hideStatColumns,
        idPrefix,
        index,
        lastRow,
        masterServant,
        visibleColumns,
        onClick,
        onContextMenu,
        onDoubleClick,
        onDragEnd,
        onDragStart,
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

    const handleDragStart = useMemo((): DragEventHandler | undefined => {
        if (!dragDropMode || !onDragStart) {
            return undefined;
        }
        return (event: DragEvent): void => {
            onDragStart(event, index);
        };
    }, [dragDropMode, index, onDragStart]);

    if (!gameServant) {
        return (
            <div className={`${StyleClassPrefix}-root`}>
                Unknown servant ID {masterServant.servantId};
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

    const stickyContentNode: ReactNode = <>
        {dragDropMode &&
            <DataTableDragHandle
                onDragStart={handleDragStart}
            />
        }
        {servantThumbnailNode}
    </>;

    const labelNode: ReactNode = (
        <MasterServantListRowLabel
            gameServant={gameServant}
        />
    );

    const statsNode: ReactNode = !hideStatColumns && (
        <MasterServantListRowStats
            active={active}
            bond={bond}
            masterServant={masterServant}
            visibleColumns={visibleColumns}
        />
    );

    const id = idPrefix && `${idPrefix}${index}`;

    return (
        <DataTableListRow
            active={active}
            borderBottom={!lastRow}
            disablePointerEvents={disablePointerEvents}
            id={id}
            noStyling
            stickyContent={stickyContentNode}
            styleClassPrefix={StyleClassPrefix}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onContextMenu={handleContextMenu}
            {...domAttributes}
        >
            <div className={`${StyleClassPrefix}-content`}>
                {labelNode}
                {statsNode}
            </div>
        </DataTableListRow>
    );

}, shouldSkipUpdate);
