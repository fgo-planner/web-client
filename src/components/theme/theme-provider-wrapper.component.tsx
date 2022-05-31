import { createTheme, Palette, Theme, ThemeProvider, Typography } from '@mui/material';
import { StyledEngineProvider, SystemStyleObject } from '@mui/system';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { ThemeConstants } from '../../styles/theme-constants';
import { SxPropsFunction, ThemeInfo } from '../../types/internal';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';
import { ThemeBackground } from './theme-background.component';

type Props = PropsWithChildren<{}>;

/**
 * Augments custom colors in the theme palette that were not automatically
 * augmented by MUI.
 */
const augmentAdditionalColors = (theme: Theme): void => {

    const palette = theme.palette as Palette;

    const {
        augmentColor,
        drawer,
        mode
    } = palette;

    if (drawer) {
        palette.drawer = augmentColor({ name: 'drawer', color: drawer });
    }

    console.log(mode, theme); // TODO Remove this
};

/**
 * Replaces the default scrollbar styles with the theme based scrollbars for
 * the children nodes.
 */
const ScrollbarStyleProps = (({ palette, spacing }: Theme) => ({
    '& *::-webkit-scrollbar': {
        width: spacing(ThemeConstants.ScrollbarWidthScale),
        height: spacing(ThemeConstants.ScrollbarWidthScale)
    },
    '& *::-webkit-scrollbar-corner': {
        backgroundColor: palette.background.paper,
    },
    '& *::-webkit-scrollbar-thumb': {
        backgroundColor: palette.primary.main,
        borderRadius: spacing(ThemeConstants.ScrollbarWidthScale / 2)
    },
    [`& .${ThemeConstants.ClassScrollbarTrackBorder}`]: {
        '& *::-webkit-scrollbar-track': {
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: palette.divider,
            borderLeftWidth: 1,
            borderLeftStyle: 'solid',
            borderLeftColor: palette.divider,
        }
    },
    [`& .${ThemeConstants.ClassScrollbarHidden}`]: {
        '&::-webkit-scrollbar': {
            display: 'none'
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
    }
} as SystemStyleObject)) as SxPropsFunction;

/**
 * Utility component for listening for theme changes from the `ThemeService` and
 * updating the application's theme state accordingly.
 */
export const ThemeProviderWrapper = React.memo(({ children }: Props) => {

    const [theme, setTheme] = useState<Theme>(createTheme); // Initialize with default Material UI theme

    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>();

    useEffect(() => {
        const onThemeChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.ThemeChange)
            .subscribe((themeInfo: ThemeInfo) => {
                const { themeOptions, backgroundImageUrl } = themeInfo;
                const theme = createTheme(themeOptions);
                augmentAdditionalColors(theme);
                setTheme(theme);
                setBackgroundImageUrl(backgroundImageUrl);
            });

        return () => onThemeChangeSubscription.unsubscribe();
    }, []);

    return <>
        <ThemeBackground imageUrl={backgroundImageUrl} />
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <Typography component={'div'} sx={ScrollbarStyleProps}>
                    {children}
                </Typography>
            </ThemeProvider>
        </StyledEngineProvider>
    </>;

});
