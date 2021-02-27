import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React from 'react';
import { Link } from 'react-router-dom';
import { AssetConstants } from '../../../constants';
import { GameItem } from '../../../types';

type Props = {
    item: Readonly<GameItem>;
    showBackground?: boolean;
    size?: string | number;
    enableLink?: boolean;
    openLinkInNewTab?: boolean;
};

const ImageBaseUrl = AssetConstants.ItemImageBaseUrl;

const style = (theme: Theme) => ({
    thumbnailContainer: {
        position: 'relative'
    },
    foreground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        padding: '12%',
        boxSizing: 'border-box',
        zIndex: 1
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'GameItemThumbnail'
};

const useStyles = makeStyles(style, styleOptions);

export const GameItemThumbnail = React.memo((props: Props) => {

    const {
        item,
        showBackground,
        size,
        enableLink,
        openLinkInNewTab
    } = props;

    const classes = useStyles();

    const itemId = item._id;
    const { name, background } = item;

    const imageUrl = `${ImageBaseUrl}/${itemId}.png`;

    const sizeStyle = {
        width: size,
        height: size
    } as React.CSSProperties;

    let thumbnail: JSX.Element | null;
    if (showBackground) {
        const backgroundUrl = AssetConstants.ItemBackgroundMap[background];
        thumbnail = (
            <div className={classes.thumbnailContainer} style={sizeStyle} >
                <img
                    className={classes.foreground}
                    src={imageUrl}
                    alt={name}
                />
                <img
                    className={classes.background}
                    src={backgroundUrl}
                    alt={background}
                />
            </div>
        );
    } else {
        thumbnail = <img src={imageUrl} style={sizeStyle} alt={name} />;
    }

    if (!enableLink) {
        return thumbnail;
    }

    const href = `/resources/items/${itemId}`;
    const target = openLinkInNewTab ? '_blank' : undefined;
    return (
        <Link to={href} target={target} style={sizeStyle}>
            {thumbnail}
        </Link>
    );

});
