import { Avatar, AvatarProps, Box } from '@material-ui/core';
import { GameServantConstants } from 'app-constants';
import { GameServant } from 'data';
import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

type Props = PropsWithChildren<{
    servant: Readonly<GameServant>;
    stage?: 1 | 2 | 3 | 4;
    size?: string | number;
    variant?: AvatarProps['variant'];
    enableLink?: boolean;
    openInNewTab?: boolean;
}>;

const ThumbnailBaseUrl = GameServantConstants.ThumbnailBaseUrl;

const ThumbnailExtension = GameServantConstants.ThumbnailExtension;

const DefaultVariant = 'square';

const DefaultStage = 1;

export const GameServantThumbnail = React.memo((props: Props) => {

    const {
        children,
        servant,
        stage,
        size,
        variant,
        enableLink,
        openInNewTab
    } = props;

    const servantId = servant._id;
    const imageUrl = `${ThumbnailBaseUrl}/f_${servantId}${stage ?? DefaultStage}.${ThumbnailExtension}`;

    const avatar = (
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

    if (!enableLink) {
        return avatar;
    }

    const href = `/resources/servants/${servantId}`;
    const target = openInNewTab ? '_blank' : undefined;
    return <Link to={href} target={target}>{avatar}</Link>;

});
