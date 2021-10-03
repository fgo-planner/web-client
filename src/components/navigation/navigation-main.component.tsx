import { Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { ThemeConstants } from '../../styles/theme-constants';
import { ThemeBackground } from '../theme/theme-background.component';
import { AppBar } from './app-bar/app-bar.component';
import { LoadingIndicatorOverlay } from './loading-indicator-overlay';

type Props = PropsWithChildren<{}>;

const style = (theme: Theme) => ({
    root: {
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh'
    },
    upperSection: {
        zIndex: 2
    },
    lowerSection: {
        // display: 'flex',
        height: `calc(100vh - ${theme.spacing(ThemeConstants.AppBarHeightScale)})`
    },
    mainContent: {
        flex: 1,
        overflow: 'none',
        background: theme.palette.background.default,
        color: theme.palette.text.primary
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'NavigationMain'
};

const useStyles = makeStyles(style, styleOptions);

export const NavigationMain = React.memo((props: Props) => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <ThemeBackground />
            <div className={classes.upperSection}>
                <AppBar />
            </div>
            <div className={clsx(classes.lowerSection, classes.mainContent)}>
                {props.children}
            </div>
            <LoadingIndicatorOverlay />
        </div>
    );

});
