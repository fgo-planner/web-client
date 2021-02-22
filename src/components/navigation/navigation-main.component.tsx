import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PropsWithChildren, UIEvent, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ThemeConstants } from '../../styles/theme-constants';
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
        display: 'flex',
        height: `calc(100vh - ${theme.spacing(ThemeConstants.AppBarHeightScale)}px)`
    },
    navRailContainer: {
        display: 'none',
        zIndex: 1,
        boxShadow: '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.014), 0 1px 3px 0 rgba(0,0,0,0.12)',
    },
    mainContent: {
        flex: 1,
        overflow: 'auto',
        background: theme.palette.background.paper,
        color: theme.palette.text.primary
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'NavigationMain'
};

const useStyles = makeStyles(style, styleOptions);

export const NavigationMain = React.memo((props: Props) => {
    const classes = useStyles();
    const history = useHistory();
    const mainContentRef = useRef<HTMLDivElement>(null);
    const [ appBarElevated, setAppBarElevated ] = useState(false);

    useEffect(() => {
        const unsubscribeHistoryListener = history.listen(() => {
            mainContentRef.current?.scrollTo(0, 0);
        });
        return (() => unsubscribeHistoryListener());
    }, [ history ]);

    const handleScroll = (event: UIEvent): void => {
        const scrollAmount = (event.target as Element)?.scrollTop;
        const isElevated = scrollAmount > ThemeConstants.AppBarElevatedScrollThreshold;
        if (isElevated !== appBarElevated) {
            setAppBarElevated(isElevated);
        }
    };
    
    return (
        <div className={classes.root}>
            <div className={classes.upperSection}>
                <AppBar appBarElevated={appBarElevated} />
            </div>
            <div className={classes.lowerSection}>
                {/* TODO Add nav rail */}
                <div 
                    ref={mainContentRef} 
                    className={classes.mainContent} 
                    onScroll={handleScroll}
                >
                    {props.children}
                </div>
            </div>
            <LoadingIndicatorOverlay />
        </div>
    );

});
