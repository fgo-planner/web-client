import { Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{}>;

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        alignItems: 'flex-end',
        position: 'fixed',
        bottom: theme.spacing(6),
        right: theme.spacing(8),
        '& >*': {
            marginLeft: theme.spacing(4)
        },
        zIndex: 2
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
