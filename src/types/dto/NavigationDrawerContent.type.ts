import React from 'react';
import { MaterialIconVariant } from '../MaterialIconVariant.type';

type BaseNavigationDrawerItem = {
    key: React.Key;
    icon: string;
    iconVariant?: MaterialIconVariant;
    activeIcon?: string;
    activeIconVariant?: MaterialIconVariant;
    label: string;
    tooltip?: string;
};

export type NavigationDrawerLinkItem = Readonly<BaseNavigationDrawerItem & {
    route: string;
    exact?: boolean;
    onClick?: React.MouseEventHandler<HTMLElement>;
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
