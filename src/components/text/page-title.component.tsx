import { makeStyles, StyleRules, Theme, Typography } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { CustomStyleProps } from '../../types';

type Props = PropsWithChildren<{}> & CustomStyleProps;

const style = (theme: Theme) => ({
    root: {
        /*
         * Use separated padding properties here so that padding-bottom can be
         * overwritten using external class rules.
         */
        paddingTop: theme.spacing(4),
        paddingRight: theme.spacing(6),
        paddingLeft: theme.spacing(6)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'PageTitle'
};

const useStyles = makeStyles(style, styleOptions);

export const PageTitle = React.memo((props: Props) => {
    const { children, className } = props;
    const styles = useStyles(props);
    const classNames = clsx(styles.root, className);
    return (
        <Typography variant="h6" className={classNames}>
            {children}
        </Typography>
    );
});
