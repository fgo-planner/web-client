import { IconButton, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { Close as CloseIcon, SvgIconComponent } from '@material-ui/icons';
import React, { MouseEvent } from 'react';

type Props = {
    icon?: SvgIconComponent,
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
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
        <IconButton className={classes.root} onClick={onClick}>
            <Icon />
        </IconButton>
    );
});
