import { GameSoundtrack } from '@fgo-planner/types';
import { alpha, Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode, useCallback, useMemo } from 'react';
import { useGameSoundtrackList } from '../../../../hooks/data/use-game-soundtrack-list.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { GameSoundtrackList } from '../../../../services/data/game/game-soundtrack.service';
import { Nullable } from '../../../../types/internal';
import { MasterSoundtracksListRow, StyleClassPrefix as MasterSoundtracksListRowStyleClassPrefix } from './master-soundtracks-list-row.component';

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
const sortByPriority = (gameSoundtrackList: Nullable<GameSoundtrackList>): GameSoundtrackList => {
    if (!gameSoundtrackList?.length) {
        return [];
    }
    return [...gameSoundtrackList].sort(prioritySort);
};

const StyleClassPrefix = 'MasterSoundtracksList';

const StyleProps = {
    pb: 20,
    [`& .${MasterSoundtracksListRowStyleClassPrefix}-root`]: {
        height: 52,
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        '&:not(:hover) .play-icon': {
            opacity: 0
        },
        [`& .${MasterSoundtracksListRowStyleClassPrefix}-unlocked-status`]: {
            width: 42,
            px: 2,
            textAlign: 'center',
        },
        [`& .${MasterSoundtracksListRowStyleClassPrefix}-thumbnail`]: {
            width: 96,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: alpha('#ffffff', 0.69),
            mr: 6
        },
        [`& .${MasterSoundtracksListRowStyleClassPrefix}-title`]: {
            flex: '1 1'
        },
        [`& .${MasterSoundtracksListRowStyleClassPrefix}-unlocked-icon`]: {
            color: 'limegreen'
        },
        [`& .${MasterSoundtracksListRowStyleClassPrefix}-play-button`]: {
            width: 48,
            pr: 24,
            pl: 4
        }
    }
} as SystemStyleObject<Theme>;

export const MasterSoundtracksList = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const {
        unlockedSoundtracksSet,
        playingId,
        editMode,
        onPlayButtonClick
    } = props;

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
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {gameSoundtrackSortedList.map(renderSoundtrackRow)}
        </Box>
    );

});
