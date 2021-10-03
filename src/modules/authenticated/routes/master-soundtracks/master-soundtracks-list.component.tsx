import { GameSoundtrack } from '@fgo-planner/types';
import { Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { useGameSoundtrackList } from '../../../../hooks/data/use-game-soundtrack-list.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { GameSoundtrackList } from '../../../../services/data/game/game-soundtrack.service';
import { MasterSoundtracksListRow } from './master-soundtracks-list-row.component';

type Props = {
    unlockedSoundtracksSet: Set<number>;
    playingId?: number;
    editMode?: boolean;
    onPlayButtonClick?: (soundtrack: GameSoundtrack, action: 'play' | 'pause') => void;
};

/**
 * Sort function for sorting soundtrack list by `priority` values in ascending
 * order.
 */
const prioritySort = (a: GameSoundtrack, b: GameSoundtrack): number => {
    return a.priority - b.priority;
};

/**
 * Returns a copy of the given soundtrack list sorted by `priority`.
 */
const sortByPriority = (gameSoundtrackList: GameSoundtrackList | undefined): GameSoundtrackList => {
    if (!gameSoundtrackList?.length) {
        return [];
    }
    return [...gameSoundtrackList].sort(prioritySort);
};

const style = (theme: Theme) => ({
    root: {
        paddingBottom: theme.spacing(20)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterSoundtracksList'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterSoundtracksList = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const {
        unlockedSoundtracksSet,
        playingId,
        editMode,
        onPlayButtonClick
    } = props;

    const classes = useStyles();

    const gameSoundtrackList = useGameSoundtrackList();

    const gameSoundtrackSortedList: GameSoundtrackList = useMemo(() => {
        return sortByPriority(gameSoundtrackList);
    }, [gameSoundtrackList]);

    const handleUnlockToggle = useCallback((id: number, value: boolean) => {
        if (value) {
            if (!unlockedSoundtracksSet.has(id)) {
                unlockedSoundtracksSet.add(id);
                forceUpdate();
            }
        } else {
            if (unlockedSoundtracksSet.has(id)) {
                unlockedSoundtracksSet.delete(id);
                forceUpdate();
            }
        }
    }, [unlockedSoundtracksSet, forceUpdate]);

    if (!gameSoundtrackSortedList.length) {
        return null;
    }

    const renderSoundtrackRow = (soundtrack: GameSoundtrack): ReactNode => {
        const soundtrackId = soundtrack._id;
        const unlocked = unlockedSoundtracksSet.has(soundtrackId) || !soundtrack.material;
        return (
            <MasterSoundtracksListRow
                key={soundtrackId}
                soundtrack={soundtrack}
                playing={soundtrackId === playingId}
                editMode={editMode}
                unlocked={unlocked}
                onPlayButtonClick={onPlayButtonClick}
                onUnlockToggle={handleUnlockToggle}
            />
        );
    };

    return (
        <div className={classes.root}>
            {gameSoundtrackSortedList.map(renderSoundtrackRow)}
        </div>
    );

});
