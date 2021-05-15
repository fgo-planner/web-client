import { createMuiTheme, Theme, ThemeProvider, Typography } from '@material-ui/core';
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { BackgroundImageContext } from '../../contexts/background-image.context';
import { ThemeInfo, ThemeService } from '../../services/user-interface/theme.service';
import { ThemeBackground } from './theme-background.component';
import { ThemeScrollbars } from './theme-scrollbars.component';

type Props = PropsWithChildren<{}>;

/**
 * Utility component for managing and updating the application's theme state.
 */
export const ThemeManager = React.memo(({ children }: Props) => {
    const [theme, setTheme] = useState<Theme>(createMuiTheme({})); // Initialize with default Material-UI theme
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>();

    useEffect(() => {
        const onThemeChangeSubscription = ThemeService.onThemeChange
            .subscribe((themeInfo: ThemeInfo) => {
                setTheme(themeInfo.theme);
                setBackgroundImageUrl(themeInfo.backgroundImageUrl);
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
            <ThemeProvider theme={theme}>
                <Typography component={'div'}>
                    <ThemeScrollbars>
                        {children}
                    </ThemeScrollbars>
                </Typography>
            </ThemeProvider>
        </BackgroundImageContext.Provider>
    );

});
