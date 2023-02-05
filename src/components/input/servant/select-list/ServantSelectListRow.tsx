import { Immutable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { Checkbox } from '@mui/material';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useRef } from 'react';
import { ServantThumbnail } from '../../../servant/ServantThumbnail';
import { TruncateText } from '../../../text/TruncateText';

type Props = {
    disabled: boolean;
    gameServant: Immutable<GameServant>;
    index: number;
    onClick: (event: MouseEvent, index: number) => void;
    selected: boolean;
    showThumbnail?: boolean;
};

const ServantThumbnailSize = 48;

export const StyleClassPrefix = 'ServantSelectListRow';

export const ServantSelectListRow = React.memo((props: Props) => {

    const {
        disabled,
        gameServant,
        index,
        onClick,
        selected,
        showThumbnail
    } = props;

    const selectedRef = useRef<boolean>(selected);
    selectedRef.current = selected;

    const handleClick = useCallback((event: MouseEvent): void => {
        if (disabled) {
            return;
        }
        onClick(event, index);
    }, [disabled, index, onClick]);

    const classNames = clsx(
        `${StyleClassPrefix}-root`,
        selected && `${StyleClassPrefix}-active`,
        disabled && `${StyleClassPrefix}-disabled`
    );

    return (
        <div className={classNames} onClick={handleClick}>
            <div className={`${StyleClassPrefix}-checkbox`}>
                <Checkbox
                    checked={selected}
                    disabled={disabled}
                />
            </div>
            <div className={`${StyleClassPrefix}-thumbnail`}>
                {showThumbnail && 
                    <ServantThumbnail
                        variant='square'
                        size={ServantThumbnailSize}
                        gameServant={gameServant}
                    />
                }
            </div>
            <TruncateText className={`${StyleClassPrefix}-name`}>
                {`${gameServant.rarity} \u2605 ${gameServant.name}`}
            </TruncateText>
        </div>
    );

});
