import { CircularProgress, Theme, useMediaQuery } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

type Props = {
    show?: boolean;
    zIndex?: number;
};

const style = () => ({
    root: {
        display: 'flex',
        // alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0
    },
    progressContainer: {
        paddingTop: '25vh'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'LoadingIndicator'
};

const useStyles = makeStyles(style, styleOptions);

export const LoadingIndicator = React.memo(({ show, zIndex }: Props) => {
    const classes = useStyles();
    const breakpointSm = useMediaQuery((theme: Theme) => theme.breakpoints.only('sm'));
    const breakpointXs = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'));
    const indicatorSize = breakpointXs ? 120 : breakpointSm ? 150 : 160;
    if (show !== undefined && !show) {
        return null;
    }
    return (
        <div className={`${classes.root} backdrop-blur`} style={{ zIndex: zIndex ?? 1 }}>
            <div className={classes.progressContainer}>
                <CircularProgress size={indicatorSize} thickness={3.7} />
            </div>
        </div>
    );
});
