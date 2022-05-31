import { SvgIconComponent } from '@mui/icons-material';
import React from 'react';

type BaseNavigationDrawerItem = {
    key: React.Key;
    icon: SvgIconComponent;
    activeIcon?: SvgIconComponent;
    label: string;
    tooltip?: string;
};

export type NavigationDrawerLinkItem = Readonly<BaseNavigationDrawerItem & {
    route: string;
    exact?: boolean;
}>;

export type NavigationDrawerActionItem = Readonly<BaseNavigationDrawerItem & {
    onClick: React.MouseEventHandler<HTMLElement>;
}>;

export type NavigationDrawerItem = NavigationDrawerLinkItem | NavigationDrawerActionItem;

export type NavigationDrawerSection = Readonly<{
    key: React.Key;
    hideDivider?: boolean;
    items: ReadonlyArray<NavigationDrawerItem>;
}>;

export type NavigationDrawerContent = {
    sections: ReadonlyArray<NavigationDrawerSection>;
};
