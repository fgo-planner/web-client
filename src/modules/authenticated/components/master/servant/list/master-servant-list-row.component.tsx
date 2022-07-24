import { GameServant, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import React, { DOMAttributes, MouseEvent, ReactNode, useCallback } from 'react';
import { GameServantThumbnail } from '../../../../../../components/game/servant/game-servant-thumbnail.component';
import { DraggableListRowContainer } from '../../../../../../components/list/draggable-list-row-container.component';
import { Immutable, ReadonlyPartial } from '../../../../../../types/internal';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { ObjectUtils } from '../../../../../../utils/object.utils';
import { MasterServantListVisibleColumns } from './master-servant-list-columns';
import { MasterServantListRowLabel } from './master-servant-list-row-label.component';
import { MasterServantListRowStats } from './master-servant-list-row-stats.component';

type Props = {
    active?: boolean;
    bond: MasterServantBondLevel | undefined;
    dragDropMode?: boolean;
    gameServant: Immutable<GameServant> | undefined; // Not optional, but possible to be undefined.
    index: number;
    lastRow?: boolean;
    masterServant: Immutable<MasterServant>;
    visibleColumns?: ReadonlyPartial<MasterServantListVisibleColumns>;
    onClick?: (e: MouseEvent<HTMLDivElement>, index: number) => void;
    onContextMenu?: (e: MouseEvent<HTMLDivElement>, index: number) => void;
    onDragOrderChange?: (sourceInstanceId: number, destinationInstanceId: number) => void;
} & Omit<DOMAttributes<HTMLDivElement>, 'onClick' | 'onContextMenu'>;

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
        onDragOrderChange,
        ...domAttributes
    } = props;

    const handleClick = useCallback((e: MouseEvent<HTMLDivElement>): void => {
        onClick?.(e, index);
    }, [index, onClick]);

    const handleContextMenu = useCallback((e: MouseEvent<HTMLDivElement>): void => {
        onContextMenu?.(e, index);
    }, [index, onContextMenu]);

    if (!gameServant) {
        return (
            <div className={`${StyleClassPrefix}-root`}>
                Unknown servant ID {masterServant.gameId};
            </div>
        );
    }

    const artStage = MasterServantUtils.getArtStage(masterServant.ascension);

    const servantThumbnailNode: ReactNode = (
        <GameServantThumbnail
            size={52}
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
        <DraggableListRowContainer
            className={`${StyleClassPrefix}-root`}
            stickyContent={servantThumbnailNode}
            draggableId={masterServant.instanceId}
            index={index}
            borderBottom={!lastRow}
            active={active}
            dragHandleVisible={dragDropMode}
            dragEnabled={dragDropMode}
            onDragOrderChange={onDragOrderChange}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            {...domAttributes}
        >
            <div className={`${StyleClassPrefix}-content`}>
                {labelNode}
                {statsNode}
            </div>
        </DraggableListRowContainer>
    );

}, shouldSkipUpdate);
