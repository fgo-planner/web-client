import { fade, makeStyles, StyleRules, Theme, Typography } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/styles';
import clsx from 'clsx';
import React, { PropsWithChildren, ReactNode } from 'react';
import { ComponentStyleProps } from '../../types/internal/props/component-style-props.type';

type Props = PropsWithChildren<{
    title?: string;
    titlePosition?: 'outside' | 'inside';
}> & ComponentStyleProps;

const DefaultTitlePosition = 'outside';

const style = (theme: Theme) => ({
    root: {
        overflow: 'hidden', 
        boxSizing: 'border-box'
    },
    background: {
        height: '100%',
        backgroundColor: fade(theme.palette.background.paper, 0.95),
        borderRadius: theme.spacing(4)
    },
    title: {
        fontSize: '1.125rem',
        fontWeight: 'normal',
        padding: theme.spacing(4, 6)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'LayoutPanelContainer'
};

const useStyles = makeStyles(style, styleOptions);

export const LayoutPanelContainer = React.memo((props: Props) => {

    const {
        children,
        title,
        className,
        style
    } = props;

    const titlePosition = props.titlePosition || DefaultTitlePosition;

    const classes = useStyles();

    const renderTitle = (): ReactNode => (
        <Typography variant="h6" className={clsx(classes.title, titlePosition)}>
            {title}
        </Typography>
    );

    return (
        <div className={clsx(classes.root, className)} style={style}>
            {title && titlePosition === 'outside' && renderTitle()}
            <div className={classes.background}>
                {title && titlePosition === 'inside' && renderTitle()}
                {children}
            </div>
        </div>
    );
});