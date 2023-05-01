import { Nullable } from '@fgo-planner/common-core';
import { GameSoundtrack } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { alpha, Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, useMemo } from 'react';
import { MasterSoundtracksRouteSoundtrackListHeader } from './MasterSoundtracksRouteSoundtrackListHeader';
import { MasterSoundtracksRouteSoundtrackListRow, StyleClassPrefix as MasterSoundtracksRouteSoundtrackListRowStyleClassPrefix } from './MasterSoundtracksRouteSoundtrackListRow';
import { GameSoundtrackList } from '../../../../../types';
import { useGameSoundtrackList } from '../../../../../hooks/data/useGameSoundtrackList';

type Props = {
    onChange: (soundtrackId: number, unlocked: boolean) => void;
    onPlayButtonClick?: (soundtrack: GameSoundtrack, action: 'play' | 'pause') => void;
    playingId?: number;
    unlockedSoundtracks: ReadonlySet<number>;
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

const StyleClassPrefix = 'MasterSoundtracksRouteSoundtrackList';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette,
        spacing
    } = theme as Theme;

    return {
        backgroundColor: palette.background.paper,
        height: '100%',
        overflow: 'auto',
        [`& .${StyleClassPrefix}-list-container`]: {
            display: 'flex',
            flexDirection: 'column',
            [`& .${MasterSoundtracksRouteSoundtrackListRowStyleClassPrefix}-root`]: {
                height: 52,
                display: 'flex',
                alignItems: 'center',
                '&:not(:hover) .play-icon': {
                    opacity: 0
                },
                [`& .${MasterSoundtracksRouteSoundtrackListRowStyleClassPrefix}-text`]: {
                    fontSize: '0.875rem'
                },
                [`& .${MasterSoundtracksRouteSoundtrackListRowStyleClassPrefix}-unlocked-status`]: {
                    width: 42,
                    px: 2,
                    textAlign: 'center',
                },
                [`& .${MasterSoundtracksRouteSoundtrackListRowStyleClassPrefix}-thumbnail`]: {
                    width: 96,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha('#ffffff', 0.69),
                    mr: 6,
                    [breakpoints.down('sm')]: {
                        display: 'none'
                    }
                },
                [`& .${MasterSoundtracksRouteSoundtrackListRowStyleClassPrefix}-play-button`]: {
                    width: spacing(14)  // 56px
                },
                [`& .${MasterSoundtracksRouteSoundtrackListRowStyleClassPrefix}-title`]: {
                    flex: '1 1',
                    minWidth: 0
                },
                [`& .${MasterSoundtracksRouteSoundtrackListRowStyleClassPrefix}-unlock-material`]: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    minWidth: spacing(20),  // 80px
                    pr: 8,
                    '>div': {
                        fontSize: '0.875rem'
                    },
                    [breakpoints.down('sm')]: {
                        pr: 6
                    }
                }
            }
        }
    } as SystemStyleObject<SystemTheme>;
};


export const MasterSoundtracksRouteSoundtrackList = React.memo((props: Props) => {

    const {
        onChange,
        onPlayButtonClick,
        playingId,
        unlockedSoundtracks
    } = props;

    const gameSoundtrackList = useGameSoundtrackList();

    const gameSoundtrackSortedList: GameSoundtrackList = useMemo(() => {
        return sortByPriority(gameSoundtrackList);
    }, [gameSoundtrackList]);

    /*
     * This can be empty during the initial render.
     */
    if (!gameSoundtrackSortedList.length) {
        return null;
    }

    const renderSoundtrackRow = (soundtrack: GameSoundtrack): ReactNode => {
        const soundtrackId = soundtrack._id;
        const unlocked = unlockedSoundtracks.has(soundtrackId);
        return (
            <MasterSoundtracksRouteSoundtrackListRow
                key={soundtrackId}
                soundtrack={soundtrack}
                playing={soundtrackId === playingId}
                unlocked={unlocked}
                onPlayButtonClick={onPlayButtonClick}
                onChange={onChange}
            />
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-list-container`}>
                <MasterSoundtracksRouteSoundtrackListHeader />
                {gameSoundtrackSortedList.map(renderSoundtrackRow)}
            </div>
        </Box>
    );

});
