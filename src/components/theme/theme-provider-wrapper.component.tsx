import { createTheme, Palette, ThemeProvider, Typography, Theme } from '@mui/material';
import { StyledEngineProvider, SystemStyleObject,  } from '@mui/system';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { BackgroundImageContext } from '../../contexts/background-image.context';
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
const ScrollbarStyleProps = ((theme: Theme) => ({
    '& *::-webkit-scrollbar': {
        width: theme.spacing(ThemeConstants.ScrollbarWidthScale),
        height: theme.spacing(ThemeConstants.ScrollbarWidthScale)
    },
    '& *::-webkit-scrollbar-corner': {
        backgroundColor: theme.palette.background.paper,
    },
    '& *::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.primary.main,
        borderRadius: theme.spacing(ThemeConstants.ScrollbarWidthScale / 2)
    },
    [`& .${ThemeConstants.ClassScrollbarTrackBorder}`]: {
        '& *::-webkit-scrollbar-track': {
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: theme.palette.divider,
            borderLeftWidth: 1,
            borderLeftStyle: 'solid',
            borderLeftColor: theme.palette.divider,
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

    // This is temporary...
    const backgroundImageContextValue = useMemo(() => ({
        imageUrl: backgroundImageUrl
    }), [backgroundImageUrl]);

    return (
        <BackgroundImageContext.Provider value={backgroundImageContextValue}>
            <ThemeBackground />
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={theme}>
                    <Typography component={'div'} sx={ScrollbarStyleProps}>
                        {children}
                    </Typography>
                </ThemeProvider>
            </StyledEngineProvider>
        </BackgroundImageContext.Provider>
    );

});
