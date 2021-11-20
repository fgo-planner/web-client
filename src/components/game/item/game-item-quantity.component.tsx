

import { GameItem } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React from 'react';
import { GameItemThumbnail } from './game-item-thumbnail.component';

type Props = {
    item: Readonly<GameItem>;
    quantity: number;
    size?: string | number;
};

const DefaultThumbnailSize = 42;

export const StyleClassPrefix = 'GameItemQuantity';

const StyleProps = {
    display: 'flex',
    alignItems: 'center',
    [`& .${StyleClassPrefix}-quantity`]: {
        width: 24,
        mr: 2,
        textAlign: 'right'
    } as SystemStyleObject<Theme>
};

export const GameItemQuantity = React.memo(({ item, quantity, size }: Props) => {

    const thumbnailSize = size || DefaultThumbnailSize;

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-quantity`}>
                {quantity}
            </div>
            <GameItemThumbnail
                item={item}
                size={thumbnailSize}
                showBackground
            />
        </Box>
    );

});
