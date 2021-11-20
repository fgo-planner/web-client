import { GameSoundtrack } from '@fgo-planner/types';
import { Done as DoneIcon, Pause as PauseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { Checkbox, IconButton } from '@mui/material';
import clsx from 'clsx';
import React, { ChangeEvent, ReactNode, useCallback, useMemo } from 'react';
import { GameItemQuantity } from '../../../../components/game/item/game-item-quantity.component';
import { StaticListRowContainer } from '../../../../components/list/static-list-row-container.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';

type Props = {
    soundtrack: Readonly<GameSoundtrack>;
    unlocked?: boolean;
    playing?: boolean;
    editMode?: boolean;
    onUnlockToggle?: (id: number, value: boolean) => void;
    onPlayButtonClick?: (soundtrack: GameSoundtrack, action: 'play' | 'pause') => void;
};

const SoundtrackThumbnailSize = 42;

export const StyleClassPrefix = 'MasterSoundtracksListRow';

export const MasterSoundtracksListRow = React.memo((props: Props) => {

    const {
        soundtrack,
        unlocked,
        playing,
        editMode,
        onUnlockToggle,
        onPlayButtonClick
    } = props;

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
                <div className={`${StyleClassPrefix}-unlocked-status`}>
                    {unlocked && <DoneIcon className={`${StyleClassPrefix}-unlocked-icon`} />}
                </div>
            );
        }
        return (
            <div className={`${StyleClassPrefix}-unlocked-status`}>
                {soundtrack.material && <Checkbox
                    checked={unlocked}
                    onChange={handleUnlockCheckboxChange}
                />}
            </div>
        );
    }, [soundtrack, editMode, unlocked, handleUnlockCheckboxChange]);

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
            <GameItemQuantity item={unlockMaterial} quantity={quantity} />
        );
    }, [soundtrack, gameItemMap]);

    const playButtonNode: ReactNode = useMemo(() => {
        return (
            <div className={`${StyleClassPrefix}-play-button`} onClick={handlePlayButtonClick}>
                <IconButton color="primary" size="large">
                    {playing ?
                        <PauseIcon /> :
                        <PlayArrowIcon />
                    }
                </IconButton>
            </div>
        );
    }, [playing, handlePlayButtonClick]);

    return (
        <StaticListRowContainer
            key={soundtrack._id}
            className={`${StyleClassPrefix}-root`}
            borderBottom
        >
            {unlockedStatusNode}
            <div className={`${StyleClassPrefix}-thumbnail`}>
                <img
                    src={soundtrack.thumbnailUrl}
                    alt={soundtrack.name}
                    height={SoundtrackThumbnailSize}
                />
            </div>
            <div className={clsx(`${StyleClassPrefix}-title`, 'truncate')}>
                {soundtrack.name}
            </div>
            {unlockMaterialNode}
            {playButtonNode}
        </StaticListRowContainer>
    );

});
