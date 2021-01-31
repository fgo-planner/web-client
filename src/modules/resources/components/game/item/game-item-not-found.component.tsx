import { StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesProps } from 'internal';
import React, { Fragment } from 'react';

type Props = {
    itemId: number | string;
} & WithStylesProps;

const style = (theme: Theme) => ({
    root: {

    }
} as StyleRules);

export const GameItemNotFound = React.memo(withStyles(style)((props: Props) => {
    return (
        <Fragment>
            {`Item '${props.itemId}' could not be found.`}
        </Fragment>
    );
}));