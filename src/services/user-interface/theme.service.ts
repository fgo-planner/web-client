import { createMuiTheme, Theme, ThemeOptions } from '@material-ui/core';
import { BehaviorSubject } from 'rxjs';
import { AssetConstants } from '../../constants';
import defaultDarkTheme from '../../styles/theme-default-dark';
import defaultLightTheme from '../../styles/theme-default-light';
import { PageMetadataService } from './page-metadata.service';

export type ThemeMode = 'light' | 'dark';

export type ThemeInfo = {
    theme: Theme;
    themeMode: ThemeMode;
    backgroundImageUrl?: string;
};

export class ThemeService {

    /**
     * Key used for storing and retrieving the last used theme mode from local
     * storage.
     */
    private static readonly _ThemeModeKey = 'theme_mode';

    private static _onThemeChange: BehaviorSubject<ThemeInfo>;
    static get onThemeChange() {
        return this._onThemeChange;
    }

    private static _themeMode: ThemeMode;

    private static _backgroundImage: string | undefined;

    /**
     * Initialization method, simulates a static constructor.
     */
    private static _initialize(): void {
        const themeMode = this._themeMode = this._loadThemeModeFromStorage();
        const themeInfo = this._getDefaultThemeForMode(themeMode);
        this._setThemeColorMeta(themeInfo.theme);
        this._onThemeChange = new BehaviorSubject<ThemeInfo>(themeInfo);
    }

    static toggleThemeMode(): void {
        if (this._themeMode === 'light') {
            this._setThemeMode('dark');
        } else {
            this._setThemeMode('light');
        }
        const themeInfo = this._getDefaultThemeForMode(this._themeMode);
        this._setThemeColorMeta(themeInfo.theme);
        this._onThemeChange.next(themeInfo);
    }

    private static _loadThemeModeFromStorage(): ThemeMode {
        let themeMode = localStorage.getItem(this._ThemeModeKey);
        if (themeMode !== 'dark') {
            /*
             * Any value that is not `dark` will be defaulted to `light`, including any
             * missing or invalid values.
             */
            themeMode = 'light';
        }
        return themeMode as ThemeMode;
    }

    private static _getDefaultThemeForMode(themeMode: ThemeMode): ThemeInfo {
        let themeOptions: ThemeOptions;
        let backgroundImageUrl: string;
        if (themeMode === 'light') {
            themeOptions = defaultLightTheme();
            backgroundImageUrl = AssetConstants.DefaultLightThemeBackground;
        } else {
            themeOptions = defaultDarkTheme();
            backgroundImageUrl = AssetConstants.DefaultDarkThemeBackground;
        }
        const theme = createMuiTheme(themeOptions);
        return { theme, themeMode, backgroundImageUrl };
    }

    /**
     * Helper method for setting the value of the `_themeMode` member variable.
     * Also writes the value to local storage.
     */
    private static _setThemeMode(themeMode: ThemeMode): void {
        this._themeMode = themeMode;
        localStorage.setItem(this._ThemeModeKey, themeMode);
    }

    /**
     * Sets the `theme-color` metadata.
     */
    private static _setThemeColorMeta(theme: Theme): void {
        PageMetadataService.setThemeColor(theme.palette.background.default);
    }

}

// Call the static initialization method.
(ThemeService as any)._initialize();
