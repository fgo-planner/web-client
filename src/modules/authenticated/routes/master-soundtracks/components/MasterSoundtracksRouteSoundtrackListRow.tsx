import { Immutable } from '@fgo-planner/common-core';
import { GameSoundtrack } from '@fgo-planner/data-core';
import { Checkbox, Icon, IconButton } from '@mui/material';
import { isEmpty } from 'lodash-es';
import React, { ChangeEvent, ReactNode, useCallback, useMemo } from 'react';
import { DataTableListRow } from '../../../../../components/data-table-list/DataTableListRow';
import { ItemQuantity } from '../../../../../components/item/ItemQuantity';
import { TruncateText } from '../../../../../components/text/TruncateText';
import { useGameItemMap } from '../../../../../hooks/data/useGameItemMap';

type Props = {
    onChange: (id: number, value: boolean) => void;
    onPlayButtonClick?: (soundtrack: GameSoundtrack, action: 'play' | 'pause') => void;
    playing?: boolean;
    soundtrack: Immutable<GameSoundtrack>;
    unlocked?: boolean;
};

const SoundtrackThumbnailSize = 42;

export const StyleClassPrefix = 'MasterSoundtracksRouteSoundtrackListRow';

export const MasterSoundtracksRouteSoundtrackListRow = React.memo((props: Props) => {

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

    const alwaysUnlocked = isEmpty(material);

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
        /**
         * There should be exactly one item.
         */
        const [key, quantity] = Object.entries(material)[0];
        const itemId = Number(key);
        const unlockMaterial = gameItemMap[itemId];
        if (!unlockMaterial) {
            return null;
        }
        return (
            <ItemQuantity gameItem={unlockMaterial} quantity={quantity} />
        );
    }, [alwaysUnlocked, gameItemMap, material]);

    const playButtonNode: ReactNode = useMemo(() => {
        return (
            <div className={`${StyleClassPrefix}-play-button`} onClick={handlePlayButtonClick}>
                <IconButton color='primary' size='large'>
                    <Icon>
                        {playing ? 'pause' : 'play_arrow'}
                    </Icon>
                </IconButton>
            </div>
        );
    }, [playing, handlePlayButtonClick]);

    return (
        <DataTableListRow
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
        </DataTableListRow>
    );

});
