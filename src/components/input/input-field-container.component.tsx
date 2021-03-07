import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { PropsWithChildren } from 'react';
import { CustomStyleProps } from '../../types';
import { StyleUtils } from '../../utils/style.utils';

type Props = PropsWithChildren<{
    width?: string | number;
    flex?: string | number;
}> & CustomStyleProps;

const style = (theme: Theme) => ({
    root: {
        height: '96px',
        boxSizing: 'border-box'
    }
    // TODO Add condensed height
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'InputFieldContainer'
};

const useStyles = makeStyles(style, styleOptions);

export const InputFieldContainer = React.memo((props: Props) => {
    const { children, className, width, flex } = props;
    const classes = useStyles(props);
    const classNames = StyleUtils.appendClassNames(classes.root, className);
    return (
        <div className={classNames} style={{ width, flex }}>
            {children}
        </div>
    );
});
