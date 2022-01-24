import { GameServant } from '@fgo-planner/types';
import { Avatar, AvatarProps } from '@mui/material';
import React, { PropsWithChildren, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AssetConstants } from '../../../constants';
import { Immutable } from '../../../types/internal';

type Props = PropsWithChildren<{
    costumeId?: number;
    enableLink?: boolean;
    gameServant: Immutable<GameServant>;
    openLinkInNewTab?: boolean;
    size?: string | number;
    stage?: 1 | 2 | 3 | 4;
    variant?: AvatarProps['variant'];
}>;

const ThumbnailBaseUrl = AssetConstants.ServantThumbnailBaseUrl;

const DefaultVariant = 'square';

const DefaultStage = 2;

const DefaultSize = 56;

export const GameServantThumbnail = React.memo((props: Props) => {

    const {
        costumeId,
        enableLink,
        gameServant,
        openLinkInNewTab,
        stage,
        variant,
        children
    } = props;

    const servantId = gameServant._id;

    const imageUrl = useMemo(() => {
        if (costumeId) {
            return `${ThumbnailBaseUrl}/f_${costumeId}0.png`;
        }
        const imageVariant = (stage ?? DefaultStage) - 1;
        return `${ThumbnailBaseUrl}/f_${servantId}${imageVariant}.png`;
    }, [costumeId, servantId, stage]);

    const size = props.size || DefaultSize;

    const avatar = (
        <Avatar
            src={imageUrl}
            variant={variant || DefaultVariant}
            style={{ width: size, height: size }}
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
