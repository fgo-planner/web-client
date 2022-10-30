import { Checkbox } from '@mui/material';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useRef } from 'react';
import { GameServantCostumeListData } from '../../../../types/data';
import { GameServantThumbnail } from '../../../game/servant/game-servant-thumbnail.component';
import { TruncateText } from '../../../text/truncate-text.component';

type Props = {
    costumeData: GameServantCostumeListData;
    disabled: boolean;
    index: number;
    onClick: (event: MouseEvent, index: number) => void;
    selected: boolean;
};

const ServantThumbnailSize = 48;

export const StyleClassPrefix = 'ServantCostumeSelectListRow';

export const ServantCostumeSelectListRow = React.memo((props: Props) => {

    const {
        costumeData: {
            costume,
            costumeId,
            servant
        },
        disabled,
        index,
        onClick,
        selected
    } = props;

    const selectedRef = useRef<boolean>(selected);
    selectedRef.current = selected;

    const handleClick = useCallback((event: MouseEvent): void => {
        onClick(event, index);
    }, [index, onClick]);

    const classNames = clsx(
        `${StyleClassPrefix}-root`,
        selected && `${StyleClassPrefix}-active`
    );

    return (
        <div className={classNames} onClick={handleClick}>
            <Checkbox
                checked={selected || disabled}
                disabled={disabled}
            />
            <div className={`${StyleClassPrefix}-thumbnail`}>
                <GameServantThumbnail
                    variant='square'
                    size={ServantThumbnailSize}
                    gameServant={servant}
                    costumeId={costumeId}
                />
            </div>
            <TruncateText className={`${StyleClassPrefix}-name`}>
                {costume.name}
            </TruncateText>
        </div>
    );

});
