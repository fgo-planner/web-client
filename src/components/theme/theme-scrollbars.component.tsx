import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/styles';
import React, { PropsWithChildren } from 'react';
import { ThemeConstants } from '../../styles/theme-constants';

type Props = PropsWithChildren<{}>;

const style = (theme: Theme) => ({
    root: {
        '& *::-webkit-scrollbar': {
            width: theme.spacing(ThemeConstants.ScrollbarWidthScale)
        },
        '& *::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            borderRadius: theme.spacing(ThemeConstants.ScrollbarWidthScale / 2)
        },
        '& .scrollbar-track-border': {
            '& *::-webkit-scrollbar-track': {
                borderLeftWidth: 1,
                borderLeftStyle: 'solid',
                borderLeftColor: theme.palette.divider,
            }
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'ThemeScrollbars'
};

const useStyles = makeStyles(style, styleOptions);

/**
 * Replaces the default scrollbar styles with the theme based scrollbars for
 * the children nodes.
 */
export const ThemeScrollbars = React.memo(({ children }: Props) => {
    const classes = useStyles();

    return <div className={classes.root}>{children}</div>;
});
