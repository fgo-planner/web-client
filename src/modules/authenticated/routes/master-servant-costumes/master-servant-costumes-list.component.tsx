import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { useGameServantList } from '../../../../hooks/data/use-game-servant-list.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { CacheArray, GameServantList } from '../../../../types/internal';
import { MasterServantCostumeRowData, MasterServantCostumesListRow, StyleClassPrefix as MasterServantCostumesListRowStyleClassPrefix } from './master-servant-costumes-list-row.component';

type Props = {
    unlockedCostumesSet: Set<number>;
    editMode?: boolean;
};

const transformCostumesList = (gameServants: GameServantList): CacheArray<MasterServantCostumeRowData> => {
    const result: MasterServantCostumeRowData[] = [];
    for (const servant of gameServants) {
        const { costumes } = servant;
        for (const [id, costume] of Object.entries(costumes)) {
            result.push({
                costumeId: Number(id),
                servant,
                ...costume
            });
        }
    }
    result.sort((a, b) => a.collectionNo - b.collectionNo);
    return result;
};

const StyleClassPrefix = 'MasterServantCostumesList';

const StyleProps = {
    pb: 20,
    [`& .${MasterServantCostumesListRowStyleClassPrefix}-root`]: {
        height: 52,
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        '&:not(:hover) .play-icon': {
            opacity: 0
        },
        [`& .${MasterServantCostumesListRowStyleClassPrefix}-unlocked-status`]: {
            width: 42,
            px: 2,
            textAlign: 'center',
        },
        [`& .${MasterServantCostumesListRowStyleClassPrefix}-collection-no`]: {
            width: 64,
            textAlign: 'center'
        },
        [`& .${MasterServantCostumesListRowStyleClassPrefix}-name`]: {
            flex: '1 1',
            minWidth: 0
        },
        [`& .${MasterServantCostumesListRowStyleClassPrefix}-unlocked-icon`]: {
            color: 'limegreen'
        },
        [`& .${MasterServantCostumesListRowStyleClassPrefix}-unlock-materials`]: {
            display: 'flex',
            justifyContent: 'flex-end',
            pr: 24
        }
    }
} as SystemStyleObject<Theme>;

export const MasterServantCostumesList = React.memo(({ unlockedCostumesSet, editMode }: Props) => {

    const forceUpdate = useForceUpdate();

    const gameServantList = useGameServantList();

    const costumesList = useMemo(() => {
        if (!gameServantList) {
            return null;
        }
        return transformCostumesList(gameServantList);
    }, [gameServantList]);

    const handleUnlockToggle = useCallback((id: number, value: boolean) => {
        if (value) {
            if (!unlockedCostumesSet.has(id)) {
                unlockedCostumesSet.add(id);
                forceUpdate();
            }
        } else {
            if (unlockedCostumesSet.has(id)) {
                unlockedCostumesSet.delete(id);
                forceUpdate();
            }
        }
    }, [forceUpdate, unlockedCostumesSet]);

    if (!costumesList?.length) {
        return null;
    }

    const renderCostumeRow = (costume: MasterServantCostumeRowData): ReactNode => {
        const { costumeId, materials } = costume;
        const unlocked = unlockedCostumesSet.has(costumeId) || !materials.materials.length;
        return (
            <MasterServantCostumesListRow
                key={costumeId}
                costume={costume}
                editMode={editMode}
                unlocked={unlocked}
                onUnlockToggle={handleUnlockToggle}
                openLinksInNewTab={editMode}
            />
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {costumesList.map(renderCostumeRow)}
        </Box>
    );

});
