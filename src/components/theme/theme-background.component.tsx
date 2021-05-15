import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { CSSProperties, WithStylesOptions } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import React from 'react';
import { BackgroundImageContext, BackgroundImageContextProps } from '../../contexts/background-image.context';
import { ComponentStyleProps } from '../../types/internal/props/component-style-props.type';

type Props = ComponentStyleProps;

const generateBackgroundStyle = (imageUrl?: string, blur?: number): CSSProperties => {
    const style: CSSProperties = {};
    if (imageUrl) {
        style.backgroundImage = `url(${imageUrl})`;
    };
    if (blur) {
        style.backdropFilter = `blur(${blur}px)`;
    }
    return style;
};

const style = (theme: Theme) => ({
    root: {
        position: 'fixed',
        zIndex: -9999,
        overflow: 'hidden'
    },
    background: {
        width: '100vw',
        height: '100vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'ThemeBackground'
};

const useStyles = makeStyles(style, styleOptions);

export const ThemeBackground = React.memo((props: Props) => {

    const {
        className,
        style
    } = props;

    const classes = useStyles();

    return (
        <div className={clsx(classes.root, className)} style={style}>
            <BackgroundImageContext.Consumer>
                {({ imageUrl, blur }: BackgroundImageContextProps) => {
                    const backgroundStyle = generateBackgroundStyle(imageUrl, blur);
                    if (!imageUrl) {
                        return null;
                    }
                    return (
                        <div className={classes.background} style={backgroundStyle} />
                    );
                }}
            </BackgroundImageContext.Consumer>
        </div>
    );

});
