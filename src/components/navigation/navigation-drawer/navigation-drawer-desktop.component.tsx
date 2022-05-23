import { Theme } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { CSSProperties } from '@mui/styles';
import { MuiStyledOptions, styled, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React from 'react';
import { ThemeConstants } from '../../../styles/theme-constants';
import { NavigationDrawerContent as Content, Supplier } from '../../../types/internal';
import { NavigationDrawerContent } from './navigation-drawer-content.component';

type Props = {
    content: Content;
    onClose: Supplier<void>;
    open: boolean;
};

type RootComponentProps = {
    expanded: boolean;
};

const StyleClassPrefix = 'NavigationDrawerDesktop';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => {
    return (
        prop !== 'expanded'
    );
};

const StyleOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    shouldForwardProp
} as MuiStyledOptions & FilteringStyledOptions<Props>;

const StyleProps = (props: RootComponentProps & { theme: SystemTheme }) => {
    const {
        palette,
        spacing
    } = props.theme as Theme;

    return {
        display: 'flex',
        flexDirection: 'column',
        // background: palette.primary.main,
        background: palette.drawer?.main,
        width: spacing(ThemeConstants.NavigationDrawerCondensedWidthScale),
        overflow: 'hidden',
        color: palette.text.primary,
        [`& .${StyleClassPrefix}-header`]: {
            height: spacing(ThemeConstants.AppBarHeightScale),
            borderBottom: `1px solid ${palette.divider}`
        },
        [`& .${StyleClassPrefix}-content-container`]: {
            overflowX: 'hidden',
            overflowY: 'auto'
        }
    } as CSSProperties;
};

const CondensedStyleProps = (props: RootComponentProps & { theme: SystemTheme }) => {
    if (props.expanded) {
        return;
    }

    const { transitions } = props.theme as Theme;

    return {
        transition: `${transitions.duration.leavingScreen}ms ${transitions.easing.sharp}`
    } as CSSProperties;
};

const ExpandedStyleProps = (props: RootComponentProps & { theme: SystemTheme }) => {
    if (!props.expanded) {
        return;
    }

    const {
        palette,
        spacing,
        transitions
    } = props.theme as Theme;

    return {
        background: palette.background.paper,
        width: spacing(ThemeConstants.NavigationDrawerExpandedWidthScale),
        transition: `${transitions.duration.enteringScreen}ms ${transitions.easing.easeOut}`
    } as CSSProperties;
};

const RootComponent = styled('div', StyleOptions)<RootComponentProps>(
    StyleProps,
    CondensedStyleProps,
    ExpandedStyleProps
);

/**
 * Variant of the navigation drawer for desktop/tablet view. This variant uses a
 * custom implementation for the drawer, stylized to closely match MUI's
 * implementation.
 */
export const NavigationDrawerDesktop = React.memo((props: Props) => {

    const {
        content,
        onClose,
        open
    } = props;

    return (
        <RootComponent className={`${StyleClassPrefix}-root`} expanded={open}>
            <div className={`${StyleClassPrefix}-header`} />
            <div className={clsx(`${StyleClassPrefix}-content-container`, !open && ThemeConstants.ClassScrollbarHidden)} >
                <NavigationDrawerContent
                    content={content}
                    onClose={onClose}
                    expanded={open}
                />
            </div>
        </RootComponent >
    );

});
