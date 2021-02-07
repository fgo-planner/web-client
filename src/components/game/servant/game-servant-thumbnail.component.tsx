import { Avatar, AvatarProps, Box } from '@material-ui/core';
import { GameServantConstants } from 'app-constants';
import { GameServant } from 'data';
import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    servant: GameServant;
    stage?: 1 | 2 | 3 | 4;
    size?: string | number;
    variant?: AvatarProps['variant'];
}>;

const ThumbnailBaseUrl = GameServantConstants.ThumbnailBaseUrl;

const ThumbnailExtension = GameServantConstants.ThumbnailExtension;

const DefaultVariant = 'square';

const DefaultStage = 1;

export const GameServantThumbnail = React.memo(({ children, servant, stage, size, variant }: Props) => {
    const imageUrl = `${ThumbnailBaseUrl}/f_${servant._id}${stage ?? DefaultStage}.${ThumbnailExtension}`;
    return (
        <Avatar
            src={imageUrl}
            variant={variant || DefaultVariant}
            component={Box}
            width={size}
            height={size}
        >
            {children || '?'}
        </Avatar>
    );
});
