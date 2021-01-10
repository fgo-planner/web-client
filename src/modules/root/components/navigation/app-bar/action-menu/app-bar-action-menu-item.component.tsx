import { ListItemIcon, ListItemText, MenuItem, StyledComponentProps, StyleRules, Theme, withStyles } from '@material-ui/core';
import { SvgIconComponent } from '@material-ui/icons';
import { WithStylesProps, WithThemeProps } from 'internal';
import React, { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { ThemeUtils } from 'utils';

type Props = {
    label: string;
    icon: SvgIconComponent;
    to?: string;
    onClick?: MouseEventHandler;
} & WithThemeProps & WithStylesProps & StyledComponentProps;

const style = (theme: Theme) => ({
    root: {
        height: ThemeUtils.spacingInPixels(theme, 10),
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
    const Icon = props.icon;
    return (
        <MenuItem className={props.classes.root} 
                  component={props.to ? Link : 'li'}
                  to={props.to}
                  onClick={props.onClick}>
            <ListItemIcon>
                <Icon />
            </ListItemIcon>
            <ListItemText primary={props.label} />
        </MenuItem>
    );
}));
