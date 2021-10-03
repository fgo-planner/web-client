import { Close as CloseIcon, SvgIconComponent } from '@mui/icons-material';
import { IconButton, Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import React, { MouseEventHandler } from 'react';

type Props = {
    icon?: SvgIconComponent,
    onClick?: MouseEventHandler;
};

const DefaultIcon = CloseIcon;

const style = (theme: Theme) => ({
    root: {
        position: 'absolute',
        right: theme.spacing(2),
        top: theme.spacing(2)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'DialogCloseButton'
};

const useStyles = makeStyles(style, styleOptions);

export const DialogCloseButton = React.memo(({ icon, onClick }: Props) => {
    const classes = useStyles();
    const Icon = icon ?? DefaultIcon;
    return (
        <IconButton className={classes.root} onClick={onClick} size="large">
            <Icon />
        </IconButton>
    );
});
