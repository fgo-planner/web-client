import { GameServant, GameServantCostume } from '@fgo-planner/types';
import { Checkbox } from '@mui/material';
import React, { ChangeEvent, ReactNode, useCallback, useMemo } from 'react';
import { GameItemQuantity } from '../../../../components/game/item/game-item-quantity.component';
import { GameServantThumbnail } from '../../../../components/game/servant/game-servant-thumbnail.component';
import { StaticListRowContainer } from '../../../../components/list/static-list-row-container.component';
import { TruncateText } from '../../../../components/text/truncate-text.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { Immutable } from '../../../../types/internal';

export type MasterServantCostumeRowData = Immutable<GameServantCostume & {
    costumeId: number;
    servant: GameServant;
}>;

type Props = {
    costume: MasterServantCostumeRowData;
    onChange: (costumeId: number, unlocked: boolean) => void;
    openLinksInNewTab?: boolean;
    unlocked?: boolean;
};

const ServantThumbnailSize = 52;

export const StyleClassPrefix = 'MasterServantCostumesListRow';

export const MasterServantCostumesListRow = React.memo((props: Props) => {

    const {
        costume: {
            collectionNo,
            costumeId,
            materials,
            name,
            servant
        },
        onChange,
        openLinksInNewTab,
        unlocked
    } = props;

    const gameItemMap = useGameItemMap();

    const handleUnlockCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        onChange(costumeId, event.target.checked);
    }, [costumeId, onChange]);

    const alwaysUnlocked = !materials.materials.length;

    const unlockedStatusNode: ReactNode = (
        <div className={`${StyleClassPrefix}-unlocked-status`}>
            {!alwaysUnlocked && <Checkbox
                checked={unlocked}
                onChange={handleUnlockCheckboxChange}
            />}
        </div>
    );

    const unlockMaterialNodes: ReactNode = useMemo(() => {
        if (!gameItemMap || alwaysUnlocked) {
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
    }, [alwaysUnlocked, gameItemMap, materials.materials]);

    return (
        <StaticListRowContainer
            key={costumeId}
            className={`${StyleClassPrefix}-root`}
            borderBottom
        >
            {unlockedStatusNode}
            <GameServantThumbnail
                variant='rounded'
                size={ServantThumbnailSize}
                gameServant={servant}
                costumeId={costumeId}
                enableLink
                openLinkInNewTab={openLinksInNewTab}
            />
            <div className={`${StyleClassPrefix}-collection-no`}>
                {collectionNo}
            </div>
            <TruncateText className={`${StyleClassPrefix}-name`}>
                {name}
            </TruncateText>
            <div className={`${StyleClassPrefix}-unlock-materials`}>
                {unlockMaterialNodes}
            </div>
        </StaticListRowContainer>
    );

});
