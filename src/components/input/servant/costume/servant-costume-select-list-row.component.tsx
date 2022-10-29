import { Checkbox } from '@mui/material';
import React, { useCallback, useRef } from 'react';
import { GameServantCostumeListData } from '../../../../types/data';
import { GameServantThumbnail } from '../../../game/servant/game-servant-thumbnail.component';
import { TruncateText } from '../../../text/truncate-text.component';

type Props = {
    costumeData: GameServantCostumeListData;
    disabled: boolean;
    onChange: (costumeId: number, selected: boolean) => void;
    selected: boolean;
};

const ServantThumbnailSize = 42;

export const StyleClassPrefix = 'ServantCostumeSelectListRow';

export const ServantCostumeSelectListRow = React.memo((props: Props) => {

    const {
        costumeData: {
            costume,
            costumeId,
            servant
        },
        disabled,
        onChange,
        selected
    } = props;

    const selectedRef = useRef<boolean>(selected);
    selectedRef.current = selected;

    const toggleSelected = useCallback((): void => {
        onChange(costumeId, !selectedRef.current);
    }, [costumeId, onChange]);

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <Checkbox
                onClick={toggleSelected}
                checked={selected || disabled}
                disabled={disabled}
            />
            <GameServantThumbnail
                variant='square'
                size={ServantThumbnailSize}
                gameServant={servant}
                costumeId={costumeId}
            />
            <TruncateText className={`${StyleClassPrefix}-name`}>
                {costume.name}
            </TruncateText>
        </div>
    );

});
