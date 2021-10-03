import { ListItemIcon, ListItemText, MenuItem, Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import { SvgIconComponent } from '@mui/icons-material';
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
            // FIXME Add hint color
            // color: theme.palette.text.hint,
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
        <MenuItem
            className={classes.root}
            component={to ? Link : 'li'}
            to={to}
            onClick={onClick}
        >
            <ListItemIcon>
                <props.icon />
            </ListItemIcon>
            <ListItemText primary={label} />
        </MenuItem>
    );
});
