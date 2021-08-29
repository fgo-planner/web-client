import { RgbaColor } from '@fgo-planner/types';
import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { Colorize as ColorizeIcon } from '@material-ui/icons';
import { colord, RgbColor } from 'colord';
import React, { MouseEventHandler } from 'react';

type Props = {
    color: Readonly<RgbaColor | RgbColor>;
    allowEditAlpha?: boolean;
    onClick?: MouseEventHandler<HTMLDivElement>
};

const Size = 64;

const style = (theme: Theme) => ({
    root: {
        width: Size,
        height: Size,
        cursor: 'pointer'
    },
    colorPickerIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: Size,
        height: Size,
        position: 'relative',
        top: 0,
        left: 0,
        color: '#FFF',
        mixBlendMode: 'difference',
        opacity: 0,
        transition: 'opacity 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        '&:hover': {
            opacity: 0.69
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'UserThemeColorSwatch'
};

const useStyles = makeStyles(style, styleOptions);

export const UserThemeColorSwatch = React.memo(({ color, allowEditAlpha, onClick }: Props) => {

    const classes = useStyles();

    return (
        <div
            className={classes.root}
            style={{ background: colord(color).toRgbString() }}
            onClick={onClick}
        >
            <div className={classes.colorPickerIcon}>
                <ColorizeIcon fontSize="large" />
            </div>
        </div>
    );

});
