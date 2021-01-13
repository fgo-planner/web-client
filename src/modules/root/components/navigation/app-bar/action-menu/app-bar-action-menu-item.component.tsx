import { ListItemIcon, ListItemText, MenuItem, StyledComponentProps, StyleRules, Theme, withStyles } from '@material-ui/core';
import { SvgIconComponent } from '@material-ui/icons';
import { WithStylesProps, WithThemeProps } from 'internal';
import React, { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

type Props = {
    label: string;
    icon: SvgIconComponent;
    to?: string;
    onClick?: MouseEventHandler;
} & WithThemeProps & WithStylesProps & StyledComponentProps;

const style = (theme: Theme) => ({
    root: {
        height: theme.spacing(10),
        '& .MuiListItemIcon-root': {
            color: theme.palette.text.hint,
            minWidth: 'initial',
            marginRight: theme.spacing(6)
        },
        '& .MuiListItemText-primary': {
            fontSize: '0.875rem'
        }
    }
} as StyleRules);

export const AppBarActionMenuItem = React.memo(withStyles(style, { withTheme: true })((props: Props) => {
    const { label, to, onClick, classes } = props;
    return (
        <MenuItem className={classes.root} 
                  component={to ? Link : 'li'}
                  to={to}
                  onClick={onClick}>
            <ListItemIcon>
                <props.icon />
            </ListItemIcon>
            <ListItemText primary={label} />
        </MenuItem>
    );
}));
