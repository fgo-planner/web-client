import { GameServantCostumeAggregatedData } from '@fgo-planner/data-core';
import { Checkbox } from '@mui/material';
import React, { ChangeEvent, ReactNode, useCallback, useMemo } from 'react';
import { DataTableListRow } from '../../../../../components/data-table-list/DataTableListRow';
import { ItemQuantity } from '../../../../../components/item/ItemQuantity';
import { ServantThumbnail } from '../../../../../components/servant/ServantThumbnail';
import { TruncateText } from '../../../../../components/text/TruncateText';
import { useGameItemMap } from '../../../../../hooks/data/useGameItemMap';

type Props = {
    costumeData: GameServantCostumeAggregatedData;
    noCostUnlock?: boolean;
    onChange: (costumeId: number, unlocked?: boolean, noCostUnlock?: boolean) => void;
    openLinksInNewTab?: boolean;
    unlocked?: boolean;
};

const ServantThumbnailSize = 52;

export const StyleClassPrefix = 'MasterServantCostumesRouteCostumeListRow';

export const MasterServantCostumesRouteCostumeListRow = React.memo((props: Props) => {

    const {
        costumeData: {
            costumeId,
            alwaysUnlocked,
            costume: {
                collectionNo,
                materials,
                name
            },
            gameServant,
            noCostUnlockAvailable
        },
        noCostUnlock,
        onChange,
        openLinksInNewTab,
        unlocked
    } = props;

    const gameItemMap = useGameItemMap();

    const handleUnlockCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        onChange(costumeId, event.target.checked);
    }, [costumeId, onChange]);

    const handleNoCostCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        onChange(costumeId, undefined, event.target.checked);
    }, [costumeId, onChange]);

    const unlockedStatusNode: ReactNode = (
        <div className={`${StyleClassPrefix}-unlocked-status`}>
            {!alwaysUnlocked && <Checkbox
                checked={unlocked}
                onChange={handleUnlockCheckboxChange}
            />}
        </div>
    );

    const noCostStatusNode: ReactNode = (
        <div className={`${StyleClassPrefix}-unlocked-status`}>
            {!alwaysUnlocked && noCostUnlockAvailable && <Checkbox
                checked={noCostUnlock}
                onChange={handleNoCostCheckboxChange}
            />}
        </div>
    );

    const unlockMaterialNodes: ReactNode = useMemo((): ReactNode => {
        if (!gameItemMap || alwaysUnlocked) {
            return null;
        }
        const nodes: Array<JSX.Element> = [];
        for (const [key, quantity] of Object.entries(materials.materials)) {
            const itemId = Number(key);
            const unlockMaterial = gameItemMap.get(itemId);
            if (!unlockMaterial) {
                continue;
            }
            nodes.push(
                <ItemQuantity key={itemId} gameItem={unlockMaterial} quantity={quantity} />
            );
        }
        return nodes;
    }, [alwaysUnlocked, gameItemMap, materials.materials]);

    return (
        <DataTableListRow
            className={`${StyleClassPrefix}-root`}
            borderBottom
        >
            {unlockedStatusNode}
            <ServantThumbnail
                variant='rounded'
                size={ServantThumbnailSize}
                gameServant={gameServant}
                costumeId={costumeId}
                enableLink
                openLinkInNewTab={openLinksInNewTab}
            />
            <div className={`${StyleClassPrefix}-collection-no`}>
                <div className={`${StyleClassPrefix}-text`}>
                    {collectionNo}
                </div>
            </div>
            <div className={`${StyleClassPrefix}-name`}>
                <TruncateText className={`${StyleClassPrefix}-text`}>
                    {name}
                </TruncateText>
            </div>
            {noCostStatusNode}
            <div className={`${StyleClassPrefix}-unlock-materials`}>
                {unlockMaterialNodes}
            </div>
        </DataTableListRow>
    );

});
