import { makeStyles, Theme } from '@material-ui/core';
import { StyleRules, WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PropsWithChildren } from 'react';
import { ThemeConstants } from 'styles';

type Props = PropsWithChildren<{}>;

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        height: theme.spacing(ThemeConstants.AppBarHeightScale),
        margin: theme.spacing(0, 2)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'AppBarLinks'
};

const useStyles = makeStyles(style, styleOptions);

export const AppBarLinks = React.memo(({ children }: Props) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            {children}
        </div>
    );
});
