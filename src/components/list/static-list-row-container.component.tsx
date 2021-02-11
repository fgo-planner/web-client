import { makeStyles, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PropsWithChildren } from 'react';
import listRowStyle from './list-row-style';

type Props = PropsWithChildren<{}>;

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'StaticListRowContainer'
};

const useStyles = makeStyles(listRowStyle, styleOptions);

export const StaticListRowContainer = React.memo(({ children }: Props) => {
    const classes = useStyles();
    return (
        <div className={classes.row}>
            {children}
        </div>
    );
});
