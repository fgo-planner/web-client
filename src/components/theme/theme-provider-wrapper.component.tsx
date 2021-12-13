import { createTheme, ThemeProvider, Typography } from '@mui/material';
import { StyledEngineProvider, Theme } from '@mui/system';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { BackgroundImageContext } from '../../contexts/background-image.context';
import { Nullable, ThemeInfo } from '../../types/internal';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../utils/subscription/subscription-topic';
import { ThemeBackground } from './theme-background.component';
import { ThemeScrollbars } from './theme-scrollbars.component';

declare module '@mui/styles/defaultTheme' {
    interface DefaultTheme extends Theme { }
}

type Props = PropsWithChildren<{}>;

/**
 * Utility component for listening for theme changes from the `ThemeService` and
 * updating the application's theme state accordingly.
 */
export const ThemeProviderWrapper = React.memo(({ children }: Props) => {

    const [theme, setTheme] = useState<Theme>(createTheme({})); // Initialize with default Material UI theme

    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>();

    useEffect(() => {
        const onThemeChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopic.UserInterface_ThemeChange)
            .subscribe((themeInfo: Nullable<ThemeInfo>) => {
                if (!themeInfo) {
                    // Is this case possible?
                    return;
                }
                const { themeOptions, backgroundImageUrl } = themeInfo;
                setTheme(createTheme(themeOptions));
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
                    <Typography component={'div'}>
                        <ThemeScrollbars>
                            {children}
                        </ThemeScrollbars>
                    </Typography>
                </ThemeProvider>
            </StyledEngineProvider>
        </BackgroundImageContext.Provider>
    );

});
