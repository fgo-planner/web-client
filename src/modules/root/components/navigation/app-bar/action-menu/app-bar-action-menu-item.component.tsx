import { ListItemIcon, ListItemText, makeStyles, MenuItem, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { SvgIconComponent } from '@material-ui/icons';
import React, { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

type Props = {
    label: string;
    icon: SvgIconComponent;
    to?: string;
    onClick?: MouseEventHandler;
};

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

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'AppBarActionMenuItem'
};

const useStyles = makeStyles(style, styleOptions);

export const AppBarActionMenuItem = React.memo((props: Props) => {
    const { label, to, onClick } = props;
    const classes = useStyles();
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
});
