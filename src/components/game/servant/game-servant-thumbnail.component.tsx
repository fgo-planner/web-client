import { Immutable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Avatar, AvatarProps } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { CSSInterpolation, MuiStyledOptions, styled, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEventHandler, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AssetConstants } from '../../../constants';

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

export const StyleClassPrefix = 'GameServantThumbnail';

type RootComponentProps = {
    renderNewTabIndicator?: boolean;
    size: string | number;
};

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => (
    prop !== 'size' &&
    prop !== 'renderNewTabIndicator'
);

const ContainerStyleOptions = {
    skipSx: true,
    skipVariantsResolver: true,
    shouldForwardProp
} as MuiStyledOptions & FilteringStyledOptions<RootComponentProps>;

const StyleProps = (props: RootComponentProps & { theme: SystemTheme }) => {

    const { size } = props;

    return {
        width: size,
        height: size,
        '& .MuiAvatar-root': {
            width: size,
            height: size,
            fontSize: 'unset',
            '&.inactive': {
                filter: 'grayscale(1.0) contrast(0.69) brightness(0.69)'
            }
        }
    } as CSSInterpolation;
};

const NewTabIndicatorStyleProps = (props: RootComponentProps & { theme: SystemTheme }) => {

    const {
        renderNewTabIndicator,
        size
    } = props;

    if (!renderNewTabIndicator) {
        return;
    }

    return {
        [`& .${StyleClassPrefix}-new-tab-indicator`]: {
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
            [`& .${StyleClassPrefix}-new-tab-indicator>div`]: {
                display: 'flex'
            }
        }
    } as CSSInterpolation;
};

const RootComponent = styled('div', ContainerStyleOptions)<RootComponentProps>(
    StyleProps,
    NewTabIndicatorStyleProps
);

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
        return <RootComponent size={size}>{avatar}</RootComponent>;
    }

    const href = `/resources/servants/${servantId}`;
    const target = openLinkInNewTab ? '_blank' : undefined;

    const renderNewTabIndicator = openLinkInNewTab && showOpenInNewTabIndicator;

    return (
        <RootComponent
            className={`${StyleClassPrefix}-root`}
            size={size}
            onClick={onClick}
            renderNewTabIndicator={renderNewTabIndicator}
        >
            <Link to={href} target={target}>
                {avatar}
                {renderNewTabIndicator &&
                    <div className={`${StyleClassPrefix}-new-tab-indicator`}>
                        <div>
                            <OpenInNewIcon />
                        </div>
                    </div>
                }
            </Link>
        </RootComponent>
    );

});
