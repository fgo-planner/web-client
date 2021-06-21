import { Checkbox, fade, IconButton, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { Done, Pause, PlayArrow } from '@material-ui/icons';
import clsx from 'clsx';
import React, { ChangeEvent, Fragment, ReactNode, useCallback, useMemo } from 'react';
import { GameItemThumbnail } from '../../../../components/game/item/game-item-thumbnail.component';
import { StaticListRowContainer } from '../../../../components/list/static-list-row-container.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { GameSoundtrack } from '../../../../types';

type Props = {
    soundtrack: Readonly<GameSoundtrack>;
    unlocked?: boolean;
    playing?: boolean;
    editMode?: boolean;
    onUnlockToggle?: (id: number, value: boolean) => void;
    onPlayButtonClick?: (soundtrack: GameSoundtrack, action: 'play' | 'pause') => void;
};

const SoundtrackThumbnailSize = 42;

const style = (theme: Theme) => ({
    root: {
        height: 52,
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        '&:not(:hover) .play-icon': {
            opacity: 0
        }
    },
    unlockedStatus: {
        width: 42,
        padding: theme.spacing(0, 2),
        textAlign: 'center',
    },
    thumbnailContainer: {
        width: 96,
        height: SoundtrackThumbnailSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: fade('#ffffff', 0.69),
        marginRight: theme.spacing(6)
    },
    title: {
        flex: '1 1'
    },
    materialQuantity: {
        width: 28,
        marginRight: theme.spacing(3),
        textAlign: 'right'
    },
    unlockedIcon: {
        color: 'limegreen'
    },
    playButton: {
        width: 48,
        paddingRight: theme.spacing(1)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterSoundtracksListRow'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterSoundtracksListRow = React.memo((props: Props) => {

    const {
        soundtrack,
        unlocked,
        playing,
        editMode,
        onUnlockToggle,
        onPlayButtonClick
    } = props;

    const classes = useStyles();

    const gameItemMap = useGameItemMap();

    const handleUnlockCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onUnlockToggle && onUnlockToggle(soundtrack._id, event.target.checked);
    }, [soundtrack._id, onUnlockToggle]);

    const handlePlayButtonClick = useCallback(() => {
        if (!onPlayButtonClick) {
            return;
        }
        const action = playing ? 'pause' : 'play';
        onPlayButtonClick(soundtrack, action);
    }, [soundtrack, playing, onPlayButtonClick]);

    const unlockedStatusNode: ReactNode = useMemo(() => {
        if (!editMode) {
            return (
                <div className={classes.unlockedStatus}>
                    {unlocked && <Done className={classes.unlockedIcon} />}
                </div>
            );
        }
        return (
            <div className={classes.unlockedStatus}>
                <Checkbox checked={unlocked} onChange={handleUnlockCheckboxChange} />
            </div>
        );
    }, [classes, editMode, unlocked, handleUnlockCheckboxChange]);

    const unlockMaterialNode: ReactNode = useMemo(() => {
        if (!gameItemMap || !soundtrack.material) {
            return null;
        }
        const { itemId, quantity } = soundtrack.material;
        const unlockMaterial = gameItemMap[itemId];
        if (!unlockMaterial) {
            return null;
        }
        return (
            <Fragment>
                <div className={classes.materialQuantity}>{quantity}</div>
                <GameItemThumbnail item={unlockMaterial} showBackground />
            </Fragment>
        );
    }, [classes, soundtrack, gameItemMap]);

    const playButtonNode: ReactNode = useMemo(() => {
        return (
            <div className={classes.playButton} onClick={handlePlayButtonClick}>
                <IconButton color="primary">
                    {playing ?
                        <Pause /> :
                        <PlayArrow className="play-icon" />
                    }
                </IconButton>
            </div>
        );
    }, [classes, playing, handlePlayButtonClick]);

    return (
        <StaticListRowContainer key={soundtrack._id} borderTop>
            <div className={classes.root}>
                {unlockedStatusNode}
                <div className={classes.thumbnailContainer}>
                    <img
                        src={soundtrack.thumbnailUrl}
                        alt={soundtrack.name}
                        height={SoundtrackThumbnailSize}
                    />
                </div>
                <div className={clsx(classes.title, 'truncate')}>
                    {soundtrack.name}
                </div>
                {unlockMaterialNode}
                {playButtonNode}
            </div>
        </StaticListRowContainer>
    );

});
