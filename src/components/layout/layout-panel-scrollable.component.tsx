import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/styles';
import clsx from 'clsx';
import React, { PropsWithChildren, ReactNode } from 'react';
import { ComponentStyleProps } from '../../types/internal/props/component-style-props.type';
import { LayoutPanelContainer } from './layout-panel-container.component';

type Props = PropsWithChildren<{
    headerContents?: ReactNode;
    footerContents?: ReactNode;
    headerBorder?: boolean;
    footerBorder?: boolean;
}> & ComponentStyleProps;

const style = (theme: Theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    headerBorder: {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider
    },
    childrenContainer: {
        overflow: 'auto',
        height: '100%'
    },
    footerBorder: {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: theme.palette.divider
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'LayoutPanelScrollable'
};

const useStyles = makeStyles(style, styleOptions);

export const LayoutPanelScrollable = React.memo((props: Props) => {

    const {
        headerContents,
        children,
        footerContents,
        headerBorder,
        footerBorder,
        className,
        style,
    } = props;

    const classes = useStyles();

    return (
        <LayoutPanelContainer className={className} style={style}>
            <div className={classes.container + ' test'}>
                {headerContents &&
                    <div className={clsx(headerBorder && classes.headerBorder)}>
                        {headerContents}
                    </div>
                }
                <div className={classes.childrenContainer}>
                    {children}
                </div>
                {footerContents &&
                    <div className={clsx(footerBorder && classes.footerBorder)}>
                        {footerContents}
                    </div>
                }
            </div>
        </LayoutPanelContainer>
    );
});
