import { makeStyles, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import listRowStyle from './list-row-style';

type Props = PropsWithChildren<{
    borderTop?: boolean;
    borderRight?: boolean;
    borderBottom?: boolean;
    borderLeft?: boolean;
}>;

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'StaticListRowContainer'
};

const useStyles = makeStyles(listRowStyle, styleOptions);

export const StaticListRowContainer = React.memo((props: Props) => {

    const {
        children,
        borderTop,
        borderRight,
        borderBottom,
        borderLeft
    } = props;

    const classes = useStyles();

    const className = clsx(
        classes.row,
        borderTop && classes.borderTop,
        borderRight && classes.borderRight,
        borderBottom && classes.borderBottom,
        borderLeft && classes.borderLeft
    );

    return (
        <div className={className}>
            {children}
        </div>
    );
    
});
