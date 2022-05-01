import { GameServant } from '@fgo-planner/types';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Avatar, AvatarProps } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { styled, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEventHandler, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AssetConstants } from '../../../constants';
import { Immutable } from '../../../types/internal';

type Props = {
    costumeId?: number;
    enableLink?: boolean;
    gameServant: Immutable<GameServant>;
    /**
     * Whether to render the thumbnail with a filter effect to indicate that the
     * servant is inactive (disabled, etc.).
     */
    inactive?: boolean;
    openLinkInNewTab?: boolean;
    onClick?: MouseEventHandler;
    showOpenInNewTabIndicator?: boolean;
    size?: string | number;
    stage?: 1 | 2 | 3 | 4;
    variant?: AvatarProps['variant'];
};

const ThumbnailBaseUrl = AssetConstants.ServantThumbnailBaseUrl;

const DefaultVariant = 'square';

const DefaultStage = 2;

const DefaultSize = 56;

const StyleClassPrefix = 'GameServantThumbnail';

type ContainerProps = {
    renderNewTabIndicator?: boolean;
    size: string | number;
};

const ContainerStyleOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipSx: true,
    shouldForwardProp: ((prop: string) => (
        prop !== 'size' &&
        prop !== 'renderNewTabIndicator'
    )) as unknown
} as FilteringStyledOptions<ContainerProps>;

const Container = styled('div', ContainerStyleOptions)<ContainerProps>(props => {

    const {
        renderNewTabIndicator,
        size
    } = props;

    let style = {
        width: size,
        height: size,
        '& .MuiAvatar-root': {
            width: size,
            height: size,
            '&.inactive': {
                filter: 'grayscale(1.0) contrast(0.69) brightness(0.69)'
            }
        }
    } as SystemStyleObject<Theme>;

    if (renderNewTabIndicator) {
        style = {
            ...style,
            '& .new-tab-indicator': {
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
                    filter: 'contrast(0.86) brightness(0.86)'
                },
                '& .new-tab-indicator>div': {
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
        inactive,
        openLinkInNewTab,
        onClick,
        showOpenInNewTabIndicator,
        stage,
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
            className={clsx(inactive && 'inactive')}
            src={imageUrl}
            variant={variant || DefaultVariant}
        />
    );

    if (!enableLink) {
        return <Container size={size}>{avatar}</Container>;
    }

    const href = `/resources/servants/${servantId}`;
    const target = openLinkInNewTab ? '_blank' : undefined;

    const renderNewTabIndicator = openLinkInNewTab && showOpenInNewTabIndicator;

    return (
        <Container
            size={size}
            onClick={onClick}
            renderNewTabIndicator={renderNewTabIndicator}
        >
            <Link to={href} target={target}>
                {avatar}
                {renderNewTabIndicator &&
                    <div className='new-tab-indicator'>
                        <div>
                            <OpenInNewIcon />
                        </div>
                    </div>
                }
            </Link>
        </Container>
    );

});
