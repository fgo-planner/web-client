import { GameSoundtrack } from '@fgo-planner/data-types';
import { Pause as PauseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { Checkbox, IconButton } from '@mui/material';
import React, { ChangeEvent, ReactNode, useCallback, useMemo } from 'react';
import { DataTableListStaticRow } from '../../../../components/data-table-list/data-table-list-static-row.component';
import { GameItemQuantity } from '../../../../components/game/item/game-item-quantity.component';
import { TruncateText } from '../../../../components/text/truncate-text.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { Immutable } from '../../../../types/internal';

type Props = {
    onChange: (id: number, value: boolean) => void;
    onPlayButtonClick?: (soundtrack: GameSoundtrack, action: 'play' | 'pause') => void;
    playing?: boolean;
    soundtrack: Immutable<GameSoundtrack>;
    unlocked?: boolean;
};

const SoundtrackThumbnailSize = 42;

export const StyleClassPrefix = 'MasterSoundtracksListRow';

export const MasterSoundtracksListRow = React.memo((props: Props) => {

    const {
        onChange,
        onPlayButtonClick,
        playing,
        soundtrack,
        unlocked
    } = props;

    const {
        _id: soundtrackId,
        material,
        name,
        thumbnailUrl
    } = soundtrack;

    const gameItemMap = useGameItemMap();

    const handleUnlockCheckboxChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        onChange(soundtrackId, event.target.checked);
    }, [onChange, soundtrackId]);

    const handlePlayButtonClick = useCallback(() => {
        if (!onPlayButtonClick) {
            return;
        }
        const action = playing ? 'pause' : 'play';
        onPlayButtonClick(soundtrack, action);
    }, [soundtrack, playing, onPlayButtonClick]);

    const alwaysUnlocked = !material;

    const unlockedStatusNode: ReactNode = (
        <div className={`${StyleClassPrefix}-unlocked-status`}>
            {!alwaysUnlocked && <Checkbox
                checked={unlocked}
                onChange={handleUnlockCheckboxChange}
            />}
        </div>
    );

    const unlockMaterialNode: ReactNode = useMemo(() => {
        if (!gameItemMap || alwaysUnlocked) {
            return null;
        }
        const { itemId, quantity } = material;
        const unlockMaterial = gameItemMap[itemId];
        if (!unlockMaterial) {
            return null;
        }
        return (
            <GameItemQuantity gameItem={unlockMaterial} quantity={quantity} />
        );
    }, [gameItemMap, alwaysUnlocked, material]);

    const playButtonNode: ReactNode = useMemo(() => {
        return (
            <div className={`${StyleClassPrefix}-play-button`} onClick={handlePlayButtonClick}>
                <IconButton color='primary' size='large'>
                    {playing ?
                        <PauseIcon /> :
                        <PlayArrowIcon />
                    }
                </IconButton>
            </div>
        );
    }, [playing, handlePlayButtonClick]);

    return (
        <DataTableListStaticRow
            key={soundtrackId}
            className={`${StyleClassPrefix}-root`}
            borderBottom
        >
            {unlockedStatusNode}
            <div className={`${StyleClassPrefix}-thumbnail`}>
                <img
                    src={thumbnailUrl}
                    alt={name}
                    height={SoundtrackThumbnailSize}
                    />
            </div>
            {playButtonNode}
            <TruncateText className={`${StyleClassPrefix}-title`}>
                {name}
            </TruncateText>
            <div className={`${StyleClassPrefix}-unlock-material`}>
                {unlockMaterialNode}
            </div>
        </DataTableListStaticRow>
    );

});
