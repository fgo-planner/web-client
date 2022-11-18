import { createTheme, Palette, Theme, ThemeProvider, Typography } from '@mui/material';
import { StyledEngineProvider } from '@mui/system';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { ScrollbarStyleProps } from '../../styles/scrollbar-style-props';
import { ThemeInfo } from '../../types';
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

    const { augmentColor, drawer } = palette;

    if (drawer) {
        palette.drawer = augmentColor({ name: 'drawer', color: drawer });
    }
};

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
