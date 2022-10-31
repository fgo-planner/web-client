import { Checkbox } from '@mui/material';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useRef } from 'react';
import { GameServantCostumeListData } from '../../../../types/data';
import { GameServantThumbnail } from '../../../game/servant/game-servant-thumbnail.component';
import { TruncateText } from '../../../text/truncate-text.component';

type Props = {
    alwaysSelected?: boolean;
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
        alwaysSelected,
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
        if (disabled || alwaysSelected) {
            return;
        }
        onClick(event, index);
    }, [alwaysSelected, disabled, index, onClick]);

    const classNames = clsx(
        `${StyleClassPrefix}-root`,
        selected && `${StyleClassPrefix}-active`,
        (disabled || alwaysSelected) && `${StyleClassPrefix}-disabled`
    );

    return (
        <div className={classNames} onClick={handleClick}>
            <div className={`${StyleClassPrefix}-checkbox`}>
                <Checkbox
                    checked={selected || alwaysSelected}
                    disabled={disabled || alwaysSelected}
                />
            </div>
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
