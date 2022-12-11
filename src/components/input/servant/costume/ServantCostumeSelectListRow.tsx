import { GameServantCostumeAggregatedData } from '@fgo-planner/data-core';
import { Checkbox } from '@mui/material';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useRef } from 'react';
import { GameServantThumbnail } from '../../../servant/ServantThumbnail';
import { TruncateText } from '../../../text/truncate-text.component';

type Props = {
    costumeData: GameServantCostumeAggregatedData;
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
            costumeId,
            alwaysUnlocked,
            costume,
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
        if (disabled || alwaysUnlocked) {
            return;
        }
        onClick(event, index);
    }, [alwaysUnlocked, disabled, index, onClick]);

    const classNames = clsx(
        `${StyleClassPrefix}-root`,
        selected && `${StyleClassPrefix}-active`,
        (disabled || alwaysUnlocked) && `${StyleClassPrefix}-disabled`
    );

    return (
        <div className={classNames} onClick={handleClick}>
            <div className={`${StyleClassPrefix}-checkbox`}>
                <Checkbox
                    checked={selected || alwaysUnlocked}
                    disabled={disabled || alwaysUnlocked}
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
