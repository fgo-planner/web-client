import { GameItem } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { CSSProperties, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AssetConstants } from '../../../constants';
import { Immutable } from '../../../types/internal';

type Props = {
    enableLink?: boolean;
    gameItem: Immutable<GameItem>;
    openLinkInNewTab?: boolean;
    size?: string | number;
    showBackground?: boolean;
};

const ImageBaseUrl = AssetConstants.ItemImageBaseUrl;

const DefaultSize = 42;

export const StyleClassPrefix = 'GameItemThumbnail';

const StyleProps = {
    [`& .${StyleClassPrefix}-composite-container`]: {
        position: 'relative'
    },
    [`& .${StyleClassPrefix}-foreground`]: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        padding: '12%',
        boxSizing: 'border-box',
        zIndex: 1
    },
    [`& .${StyleClassPrefix}-background`]: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }
} as SystemStyleObject<Theme>;

export const GameItemThumbnail = React.memo((props: Props) => {

    const {
        enableLink,
        gameItem,
        openLinkInNewTab,
        size,
        showBackground
    } = props;

    const itemId = gameItem._id;
    const { name, background } = gameItem;

    const imageUrl = `${ImageBaseUrl}/${itemId}.png`;

    const sizeStyle = useMemo(() => ({
        width: size || DefaultSize,
        height: size || DefaultSize
    } as CSSProperties), [size]);

    let thumbnail: JSX.Element | null;
    if (showBackground) {
        const backgroundUrl = AssetConstants.ItemBackgroundMap[background];
        thumbnail = (
            <div className={`${StyleClassPrefix}-composite-container`} style={sizeStyle}>
                <img
                    className={`${StyleClassPrefix}-foreground`}
                    src={imageUrl}
                    alt={name}
                />
                <img
                    className={`${StyleClassPrefix}-background`}
                    src={backgroundUrl}
                    alt={background}
                />
            </div>
        );
    } else {
        thumbnail = <img src={imageUrl} style={sizeStyle} alt={name} />;
    }

    /**
     * If link is enabled, then wrap the thumbnail in a link component.
     */
    if (enableLink) {
        const href = `/resources/items/${itemId}`;
        const target = openLinkInNewTab ? '_blank' : undefined;
        thumbnail = (
            <Link
                // style={sizeStyle}
                to={href}
                target={target}
            >
                {thumbnail}
            </Link>
        );
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {thumbnail}
        </Box>
    );

});
