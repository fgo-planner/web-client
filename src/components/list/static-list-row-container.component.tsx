import { makeStyles, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import listRowStyle from './list-row-style';

type Props = PropsWithChildren<{
    active?: boolean;
    borderTop?: boolean;
    borderBottom?: boolean;
}>;

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'StaticListRowContainer'
};

const useStyles = makeStyles(listRowStyle, styleOptions);

export const StaticListRowContainer = React.memo((props: Props) => {

    const {
        children,
        active,
        borderTop,
        borderBottom
    } = props;

    const classes = useStyles();

    const className = clsx(
        classes.row,
        active && classes.active,
        borderTop && classes.borderTop,
        borderBottom && classes.borderBottom
    );

    return (
        <div className={className}>
            {children}
        </div>
    );
    
});
