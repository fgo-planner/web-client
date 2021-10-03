import { Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { WithStylesOptions } from '@mui/styles';
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
