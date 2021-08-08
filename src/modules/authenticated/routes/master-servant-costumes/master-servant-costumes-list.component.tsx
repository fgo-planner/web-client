import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { useGameServantList } from '../../../../hooks/data/use-game-servant-list.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { GameServantList } from '../../../../services/data/game/game-servant.service';
import { CacheArray } from '../../../../types/internal';
import { MasterServantCostumeRowData, MasterServantCostumesListRow } from './master-servant-costumes-list-row.component';

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

const style = (theme: Theme) => ({
    root: {
        paddingBottom: theme.spacing(20)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantCostumesList'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantCostumesList = React.memo(({ unlockedCostumesSet, editMode }: Props) => {

    const forceUpdate = useForceUpdate();

    const classes = useStyles();

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
        <div className={classes.root}>
            {costumesList.map(renderCostumeRow)}
        </div>
    );

});
