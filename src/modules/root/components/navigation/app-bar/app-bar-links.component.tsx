import { makeStyles, Theme } from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import React, { PropsWithChildren } from 'react';
import { ThemeConstants } from 'styles';

type Props = PropsWithChildren<{}>;

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex',
        height: theme.spacing(ThemeConstants.AppBarHeightScale),
        margin: theme.spacing(0, 2)
    }
} as StyleRules));

export const AppBarLinks = React.memo(({ children }: Props) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            {children}
        </div>
    );
});
