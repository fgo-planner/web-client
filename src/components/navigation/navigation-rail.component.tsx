import { Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { ComponentStyleProps } from '../../types/internal/props/component-style-props.type';

type Props = PropsWithChildren<{
    width?: number | string;
}> & ComponentStyleProps;

const DefaultWidth = 56;

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        paddingTop: theme.spacing(2),
        '& >*': {
            // https://material.io/components/navigation-rail#specs
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1)
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'NavigationRail'
};

const useStyles = makeStyles(style, styleOptions);

export const NavigationRail = React.memo((props: Props) => {
    const { children, className, style } = props;

    const classes = useStyles();

    const width = props.width || DefaultWidth;

    return (
        <div className={clsx(classes.root, className)} style={{ ...style, width }}>
            {children}
        </div>
    );

});
