import { Theme, Typography } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { ComponentStyleProps } from '../../types/internal';

type Props = PropsWithChildren<{}> & ComponentStyleProps;

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
