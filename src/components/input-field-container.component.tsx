import { StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesProps } from 'internal';
import React, { PropsWithChildren } from 'react';
import { StyleUtils } from 'utils';

type Props = PropsWithChildren<{
    className?: string;
    width?: string;
    flex?: string | number;
}> & WithStylesProps;

const style = (theme: Theme) => ({
    root: {
        height: '96px',
        padding: theme.spacing(0, 2)
    }
    // TODO Add condensed height
} as StyleRules);

export const InputFieldContainer = React.memo(withStyles(style)((props: Props) => {
    const { children, classes, className, width, flex } = props;
    const classNames = StyleUtils.appendClassNames(classes.root, className);
    return (
        <div className={classNames} style={{ width, flex }} >
            {children}
        </div>
    );
}));