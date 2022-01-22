import { GameServant, GameServantCostume } from '@fgo-planner/types';
import { Done as DoneIcon } from '@mui/icons-material';
import { Checkbox } from '@mui/material';
import clsx from 'clsx';
import React, { ChangeEvent, ReactNode, useCallback, useMemo } from 'react';
import { GameItemQuantity } from '../../../../components/game/item/game-item-quantity.component';
import { GameServantThumbnail } from '../../../../components/game/servant/game-servant-thumbnail.component';
import { StaticListRowContainer } from '../../../../components/list/static-list-row-container.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { Immutable } from '../../../../types/internal';

export type MasterServantCostumeRowData = Immutable<GameServantCostume & {
    costumeId: number;
    servant: GameServant;
}>;

type Props = {
    costume: MasterServantCostumeRowData;
    unlocked?: boolean;
    editMode?: boolean;
    openLinksInNewTab?: boolean;
    onUnlockToggle?: (id: number, value: boolean) => void;
};

const ServantThumbnailSize = 48;

export const StyleClassPrefix = 'MasterServantCostumesListRow';

export const MasterServantCostumesListRow = React.memo((props: Props) => {

    const {
        costume,
        unlocked,
        editMode,
        openLinksInNewTab,
        onUnlockToggle
    } = props;

    const {
        costumeId,
        servant,
        collectionNo,
        name,
        materials
    } = costume;

    const gameItemMap = useGameItemMap();

    const handleUnlockCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onUnlockToggle && onUnlockToggle(costumeId, event.target.checked);
    }, [costumeId, onUnlockToggle]);

    const unlockedStatusNode: ReactNode = useMemo(() => {
        if (!editMode) {
            return (
                <div className={`${StyleClassPrefix}-unlocked-status`}>
                    {unlocked && <DoneIcon className={`${StyleClassPrefix}-unlocked-icon`} />}
                </div>
            );
        }
        const defaultUnlocked = !materials.materials.length;
        return (
            <div className={`${StyleClassPrefix}-unlocked-status`}>
                {!defaultUnlocked && <Checkbox
                    checked={unlocked}
                    onChange={handleUnlockCheckboxChange}
                />}
            </div>
        );
    }, [editMode, handleUnlockCheckboxChange, materials, unlocked]);

    const unlockMaterialNodes: ReactNode = useMemo(() => {
        if (!gameItemMap || !materials.materials.length) {
            return null;
        }
        const nodes: ReactNode[] = [];
        for (const material of materials.materials) {
            const { itemId, quantity } = material;
            const unlockMaterial = gameItemMap[itemId];
            if (!unlockMaterial) {
                continue;
            }
            nodes.push(
                <GameItemQuantity key={itemId} gameItem={unlockMaterial} quantity={quantity} />
            );
        }
        return nodes;
    }, [gameItemMap, materials]);

    return (
        <StaticListRowContainer
            key={costumeId}
            className={`${StyleClassPrefix}-root`}
            borderBottom
        >
            {unlockedStatusNode}
            <GameServantThumbnail
                variant="rounded"
                size={ServantThumbnailSize}
                servant={servant}
                costumeId={costumeId}
                enableLink
                openLinkInNewTab={openLinksInNewTab}
            />
            <div className={`${StyleClassPrefix}-collection-no`}>
                {collectionNo}
            </div>
            <div className={clsx(`${StyleClassPrefix}-name`, 'truncate')}>
                {name}
            </div>
            <div className={`${StyleClassPrefix}-unlock-materials`}>
                {unlockMaterialNodes}
            </div>
        </StaticListRowContainer>
    );

});
