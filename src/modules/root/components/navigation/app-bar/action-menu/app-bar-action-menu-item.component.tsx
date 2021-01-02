import { ListItemIcon, ListItemText, MenuItem, StyledComponentProps, StyleRules, Theme, withStyles, lighten } from '@material-ui/core';
import { SvgIconComponent } from '@material-ui/icons';
import { WithStylesProps, WithThemeProps } from 'internal';
import React, { PureComponent, ReactNode, Fragment, MouseEventHandler } from 'react';
import { ThemeUtils } from 'utils';
import { Link } from 'react-router-dom';

type Props = {
    label: string;
    icon: SvgIconComponent;
    to?: string;
    onClick?: MouseEventHandler;
} & WithThemeProps & WithStylesProps & StyledComponentProps;

const style = (theme: Theme) => ({
    root: {
        '& .MuiListItem-root': {
            height: ThemeUtils.spacingInPixels(theme, 10),
            '& .MuiListItemIcon-root': {
                color: theme.palette.text.hint,
                minWidth: 'initial',
                marginRight: theme.spacing(6)
            },
            '& .MuiListItemText-primary': {
                fontSize: '14px'
            }
        }
    }
} as StyleRules);

export const AppBarActionMenuItem = withStyles(style, { withTheme: true })(class extends PureComponent<Props> {

    render(): ReactNode {
        const Icon = this.props.icon;
        const to = this.props.to;
        return (
            <MenuItem className={this.props.classes.root} 
                      component={to ? Link : 'li'}
                      to={to}
                      onClick={this.props.onClick}>
                <ListItemIcon>
                    <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={this.props.label} />
            </MenuItem>
        );
    }

});
