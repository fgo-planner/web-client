import { createMuiTheme, Theme } from '@material-ui/core';
import { BehaviorSubject } from 'rxjs';
import defaultDarkTheme from '../../styles/theme-default-dark';
import defaultLightTheme from '../../styles/theme-default-light';
import { ThemeMode } from '../../types';

export class ThemeService {

    /**
     * Key used for storing and retrieving the last used theme mode from local
     * storage.
     */
    private static readonly _ThemeModeKey = 'theme_mode';

    private static _onThemeChange: BehaviorSubject<Theme>;
    static get onThemeChange() {
        return this._onThemeChange;
    }

    private static _themeMode: ThemeMode;
    static get themeMode() {
        return this._themeMode;
    }

    /**
     * Initialization method, simulates a static constructor.
     */
    private static _initialize(): void {
        this._themeMode = this._loadThemeModeFromStorage();
        const theme = this._getDefaultThemeForMode(this._themeMode);
        this._onThemeChange = new BehaviorSubject<Theme>(theme);
    }

    static toggleThemeMode(): void {
        if (this._themeMode === 'light') {
            this._setThemeMode('dark');
        } else {
            this._setThemeMode('light');
        }
        const theme = this._getDefaultThemeForMode(this._themeMode);
        this._onThemeChange.next(theme);
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

    private static _getDefaultThemeForMode(themeMode: ThemeMode): Theme {
        const themeOptions = themeMode === 'light' ? defaultLightTheme() : defaultDarkTheme();
        return createMuiTheme(themeOptions);
    }

    /**
     * Helper method for setting the value of the `_themeMode` member variable.
     * Also writes the value to local storage.
     */
    private static _setThemeMode(themeMode: ThemeMode): void {
        this._themeMode = themeMode;
        localStorage.setItem(this._ThemeModeKey, themeMode);
    }

}

// Call the static initialization method.
(ThemeService as any)._initialize();
