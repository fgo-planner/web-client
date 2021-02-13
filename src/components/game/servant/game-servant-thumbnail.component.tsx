import { Avatar, AvatarProps, Box } from '@material-ui/core';
import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { AssetConstants } from '../../../constants';
import { GameServant } from '../../../types';

type Props = PropsWithChildren<{
    servant: Readonly<GameServant>;
    stage?: 1 | 2 | 3 | 4;
    size?: string | number;
    variant?: AvatarProps['variant'];
    enableLink?: boolean;
    openLinkInNewTab?: boolean;
}>;

const ThumbnailBaseUrl = AssetConstants.ServantThumbnailBaseUrl;

const DefaultVariant = 'square';

const DefaultStage = 2;

export const GameServantThumbnail = React.memo((props: Props) => {

    const {
        children,
        servant,
        stage,
        size,
        variant,
        enableLink,
        openLinkInNewTab
    } = props;

    const servantId = servant._id;
    const imageVariant = (stage ?? DefaultStage) - 1;
    const imageUrl = `${ThumbnailBaseUrl}/f_${servantId}${imageVariant}.png`;

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
    const target = openLinkInNewTab ? '_blank' : undefined;
    return <Link to={href} target={target}>{avatar}</Link>;

});
