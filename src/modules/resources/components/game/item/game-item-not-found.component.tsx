import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { Fragment } from 'react';

type Props = {
    itemId: number | string;
};

const style = (theme: Theme) => ({
    root: {
        // TODO Implement this
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'GameItemNotFound'
};

const useStyles = makeStyles(style, styleOptions);

export const GameItemNotFound = React.memo((props: Props) => {
    const classes = useStyles();
    return (
        <Fragment>
            {`Item '${props.itemId}' could not be found.`}
        </Fragment>
    );
});
