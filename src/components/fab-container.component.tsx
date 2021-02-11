import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{}>;

const style = (theme: Theme) => ({
    root: {
        position: 'fixed',
        bottom: theme.spacing(6),
        right: theme.spacing(8),
        '& .MuiFab-root': {
            marginLeft: theme.spacing(4)
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'FabContainer'
};

const useStyles = makeStyles(style, styleOptions);

export const FabContainer = React.memo(({ children }: Props) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            {children}
        </div>
    );
});
