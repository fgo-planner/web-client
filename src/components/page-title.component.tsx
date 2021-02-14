import { makeStyles, StyleRules, Theme, Typography } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{}>;

const style = (theme: Theme) => ({
    root: {
        padding: theme.spacing(4, 6, 8, 6)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'PageTitle'
};

const useStyles = makeStyles(style, styleOptions);

export const PageTitle = React.memo(({ children }: Props) => {
    const styles = useStyles();
    return (
        <Typography variant="h6" className={styles.root}>
            {children}
        </Typography>
    );
});
