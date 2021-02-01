import { StyleRules, withStyles } from '@material-ui/core';
import { WithStylesProps } from 'internal';
import React, { PropsWithChildren } from 'react';
import { StyleUtils } from 'utils';

type Props = PropsWithChildren<{
    className?: string;
    width?: number; // TODO Make use of this
}> & WithStylesProps;

const style = () => ({
    root: {
        height: '96px'
    }
    // TODO Add condensed height
} as StyleRules);

export const TextFieldContainer = React.memo(withStyles(style)((props: Props) => {
    const { children, classes, className } = props;
    const classNames = StyleUtils.appendClassNames(classes.root, className);
    return (
        <div className={classNames}>
            {children}
        </div>
    );
}));