import { SvgIconComponent } from '@mui/icons-material';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import React, { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';

type Props = {
    label: string;
    icon: SvgIconComponent;
    to?: string;
    onClick?: MouseEventHandler;
};

export const StyleClassPrefix = 'AppBarActionMenuItem';

export const AppBarActionMenuItem = React.memo((props: Props) => {
    const { label, to, onClick } = props;
    return (
        <MenuItem
            className={`${StyleClassPrefix}-root`}
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
