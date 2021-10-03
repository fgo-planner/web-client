import { Theme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import React, { PropsWithChildren } from 'react';
import { ThemeConstants } from '../../../styles/theme-constants';

type Props = PropsWithChildren<{}>;

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        height: theme.spacing(ThemeConstants.AppBarHeightScale),
        margin: theme.spacing(0, 2)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'AppBarLinks'
};

const useStyles = makeStyles(style, styleOptions);

export const AppBarLinks = React.memo(({ children }: Props) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            {children}
        </div>
    );
});
