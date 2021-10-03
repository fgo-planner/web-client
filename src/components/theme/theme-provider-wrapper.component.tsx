import {
    createTheme,
    Theme,
    ThemeProvider,
    StyledEngineProvider,
    Typography,
    adaptV4Theme,
} from '@mui/material';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { BackgroundImageContext } from '../../contexts/background-image.context';
import { ThemeInfo, ThemeService } from '../../services/user-interface/theme.service';
import { ThemeBackground } from './theme-background.component';
import { ThemeScrollbars } from './theme-scrollbars.component';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


type Props = PropsWithChildren<{}>;

/**
 * Utility component for listening for theme changes from the `ThemeService` and
 * updating the application's theme state accordingly.
 */
export const ThemeProviderWrapper = React.memo(({ children }: Props) => {

    const [theme, setTheme] = useState<Theme>(createTheme(adaptV4Theme({}))); // Initialize with default Material-UI theme
    
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>();

    useEffect(() => {
        const onThemeChangeSubscription = ThemeService.onThemeChange
            .subscribe((themeInfo: ThemeInfo) => {
                const { themeOptions, backgroundImageUrl } = themeInfo;
                setTheme(createTheme(adaptV4Theme(themeOptions)));
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
