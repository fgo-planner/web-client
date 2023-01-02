import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import React, { MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { MaterialIconVariant } from '../../../../types';
import { Icon } from '../../../icons';

type Props = {
    icon: string;
    iconVariant?: MaterialIconVariant;
    label: string;
    onClick?: MouseEventHandler;
    to?: string;
};

export const StyleClassPrefix = 'AppBarActionMenuItem';

export const AppBarActionMenuItem = React.memo((props: Props) => {

    const {
        icon,
        iconVariant,
        label,
        onClick,
        to,
    } = props;

    return (
        <MenuItem
            className={`${StyleClassPrefix}-root`}
            component={to ? Link : 'li'}
            to={to}
            onClick={onClick}
        >
            <ListItemIcon>
                <Icon variant={iconVariant}>{icon}</Icon>
            </ListItemIcon>
            <ListItemText primary={label} />
        </MenuItem>
    );

});
