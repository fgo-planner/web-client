import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { CustomStyleProps } from 'internal';
import React, { PropsWithChildren } from 'react';
import { StyleUtils } from 'utils';

type Props = PropsWithChildren<{
    width?: string;
    flex?: string | number;
}> & CustomStyleProps;

const style = (theme: Theme) => ({
    inputFieldContainer: {
        height: '96px',
        padding: theme.spacing(0, 2)
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
    const classNames = StyleUtils.appendClassNames(classes.inputFieldContainer, className);
    return (
        <div className={classNames} style={{ width, flex }}>
            {children}
        </div>
    );
});
