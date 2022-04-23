import { GameServant } from '@fgo-planner/types';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Avatar, AvatarProps } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { styled, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AssetConstants } from '../../../constants';
import { Immutable } from '../../../types/internal';

type Props = {
    costumeId?: number;
    enableLink?: boolean;
    gameServant: Immutable<GameServant>;
    openLinkInNewTab?: boolean;
    showOpenInNewTabIndicator?: boolean;
    size?: string | number;
    stage?: 1 | 2 | 3 | 4;
    unsummoned?: boolean;
    variant?: AvatarProps['variant'];
};

const ThumbnailBaseUrl = AssetConstants.ServantThumbnailBaseUrl;

const DefaultVariant = 'square';

const DefaultStage = 2;

const DefaultSize = 56;

const StyleClassPrefix = 'GameServantThumbnail';

type ContainerProps = {
    showOpenInNewTabIndicator?: boolean;
    size: string | number;
};

const ContainerStyleOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipSx: true,
    shouldForwardProp: ((prop: string) => (
        prop !== 'size'
    )) as unknown
} as FilteringStyledOptions<ContainerProps>;

const Container = styled('div', ContainerStyleOptions)<ContainerProps>(props => {

    const {
        showOpenInNewTabIndicator,
        size
    } = props;

    let style = {
        width: size,
        height: size,
        '& .MuiAvatar-root': {
            width: size,
            height: size,
            '&.unsummoned': {
                filter: 'grayscale(1.0) contrast(0.69) brightness(0.69)'
            }
        }
    } as SystemStyleObject<Theme>;

    if (showOpenInNewTabIndicator) {
        style = {
            ...style,
            '& .open-in-new-tab-indicator': {
                height: 0,
                '&>div': {
                    height: size,
                    width: size,
                    position: 'relative',
                    top: -size,
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }
            },
            '&:hover': {
                '& .MuiAvatar-root>img': {
                    filter: 'grayscale(0.69) contrast(0.69) blur(1px)'
                },
                '& .open-in-new-tab-indicator>div': {
                    display: 'flex'
                }
            }
        };
    }

    return style as any;
});

export const GameServantThumbnail = React.memo((props: Props) => {

    const {
        costumeId,
        enableLink,
        gameServant,
        openLinkInNewTab,
        showOpenInNewTabIndicator,
        stage,
        unsummoned,
        variant
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
            className={clsx(unsummoned && 'unsummoned')}
            src={imageUrl}
            variant={variant || DefaultVariant}
        />
    );

    if (!enableLink) {
        return <Container size={size}>{avatar}</Container>;
    }

    const href = `/resources/servants/${servantId}`;
    const target = openLinkInNewTab ? '_blank' : undefined;

    if (!showOpenInNewTabIndicator) {
        return (
            <Container size={size}>
                <Link to={href} target={target}>{avatar}</Link>
            </Container>
        );
    }

    return (
        <Container size={size} showOpenInNewTabIndicator>
            <Link to={href} target={target}>
                {avatar}
                <div className='open-in-new-tab-indicator'>
                    <div>
                        <OpenInNewIcon />
                    </div>
                </div>
            </Link>
        </Container>
    );

});
