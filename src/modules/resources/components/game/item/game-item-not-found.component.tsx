import { Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
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
