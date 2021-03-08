import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { CSSProperties, WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PropsWithChildren, ReactNode } from 'react';

type Props = PropsWithChildren<{
    contents?: ReactNode;
    width?: number | string;
    show?: boolean;
    disableAnimations?: boolean
}>;

const DefaultWidth = 56;

const TransitionDuration = 100;

const TransitionTimingFunction = 'ease-in-out';

const style = (theme: Theme) => ({
    root: {
        display: 'flex'
    },
    navigationRail: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        position: 'fixed',
        paddingTop: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: theme.palette.divider,
        transition: `left ${TransitionDuration}ms ${TransitionTimingFunction}`,
        '& >*': {
            // https://material.io/components/navigation-rail#specs
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1)
        }
    },
    childrenContainer: {
        flex: 1,
        transition: `margin ${TransitionDuration}ms ${TransitionTimingFunction}` 
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'NavigationRail'
};

const useStyles = makeStyles(style, styleOptions);

export const NavigationRail = React.memo((props: Props) => {
    const {
        children,
        contents,
        show,
        disableAnimations
    } = props;

    let { width } = props;

    const classes = useStyles();

    width = width || DefaultWidth;

    const navigationRailStyle: CSSProperties = {
        width,
        left: show ? 0 : -width,
        transition: disableAnimations ? 'none' : undefined
    };

    const childrenContainerStyle: CSSProperties = {
        marginLeft: show ? width : 0,
        transition: disableAnimations ? 'none' : undefined
    };

    return (
        <div className={classes.root}>
            <div className={classes.navigationRail} style={navigationRailStyle}>
                {contents}
            </div>
            <div className={classes.childrenContainer} style={childrenContainerStyle}>
                {children}
            </div>
        </div>
    );

});
