import { Theme } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { CSSInterpolation, MuiStyledOptions, styled, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { CSSProperties, useContext } from 'react';
import { NavigationDrawerContext } from '../../../contexts/navigation-drawer.context';
import { ThemeConstants } from '../../../styles/theme-constants';
import { NavigationDrawerContent as Content } from '../../../types/internal';
import { NavigationDrawerContent } from './navigation-drawer-content.component';

type Props = {
    content: Content;
};

type RootComponentProps = {
    animationsDisabled?: boolean;
    expanded: boolean;
};

const StyleClassPrefix = 'NavigationDrawerDesktop';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => {
    return (
        prop !== 'animationsDisabled' &&
        prop !== 'expanded'
    );
};

const StyleOptions = {
    shouldForwardProp,
    skipSx: true,
    skipVariantsResolver: true
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
    } as CSSInterpolation;
};

const CondensedStyleProps = (props: RootComponentProps & { theme: SystemTheme }) => {
    const {
        animationsDisabled,
        expanded,
        theme
    } = props;

    if (expanded) {
        return;
    }

    const { transitions } = theme as Theme;

    const properties = {} as CSSProperties;

    if (!animationsDisabled) {
        properties.transition = `${transitions.duration.leavingScreen}ms ${transitions.easing.sharp}`;
    }

    return properties as CSSInterpolation;
};

const ExpandedStyleProps = (props: RootComponentProps & { theme: SystemTheme }) => {
    const {
        animationsDisabled,
        expanded,
        theme
    } = props;

    if (!expanded) {
        return;
    }

    const {
        palette,
        spacing,
        transitions
    } = theme as Theme;

    const properties = {
        background: palette.background.paper,
        width: spacing(ThemeConstants.NavigationDrawerExpandedWidthScale),
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: palette.divider
    } as CSSProperties;

    if (!animationsDisabled) {
        properties.transition = `${transitions.duration.enteringScreen}ms ${transitions.easing.easeOut}`;
    }

    return properties as CSSInterpolation;
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
export const NavigationDrawerDesktop = React.memo(({ content }: Props) => {

    const {
        animationsDisabled,
        expanded,
        open
    } = useContext(NavigationDrawerContext);

    return (
        <RootComponent
            className={`${StyleClassPrefix}-root`}
            animationsDisabled={animationsDisabled}
            expanded={expanded}
        >
            <div className={`${StyleClassPrefix}-header`} />
            <div className={clsx(`${StyleClassPrefix}-content-container`, !open && ThemeConstants.ClassScrollbarHidden)} >
                <NavigationDrawerContent content={content} />
            </div>
        </RootComponent >
    );

});
