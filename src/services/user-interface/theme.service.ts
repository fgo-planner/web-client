import { createMuiTheme, Theme } from '@material-ui/core';
import { BehaviorSubject } from 'rxjs';
import { Service } from 'typedi';
import defaultDarkTheme from '../../styles/theme-default-dark';
import defaultLightTheme from '../../styles/theme-default-light';
import { ThemeMode } from '../../types';

@Service()
export class ThemeService {

    /**
     * Key used for storing and retrieving the last used theme mode from local
     * storage.
     */
    private static readonly ThemeModeKey = 'theme_mode';

    readonly onThemeChange: BehaviorSubject<Theme>;

    private _themeMode: ThemeMode;
    get themeMode() {
        return this._themeMode;
    }

    constructor() {
        this._themeMode = this._loadThemeModeFromStorage();
        const theme = this._getDefaultThemeForMode(this._themeMode);
        this.onThemeChange = new BehaviorSubject<Theme>(theme);
    }

    toggleThemeMode(): void {
        if (this._themeMode === 'light') {
            this._setThemeMode('dark');
        } else {
            this._setThemeMode('light');
        }
        const theme = this._getDefaultThemeForMode(this._themeMode);
        this.onThemeChange.next(theme);
    }

    private _loadThemeModeFromStorage(): ThemeMode {
        let themeMode = localStorage.getItem(ThemeService.ThemeModeKey);
        if (themeMode !== 'dark') {
            /*
             * Any value that is not `dark` will be defaulted to `light`, including any
             * missing or invalid values.
             */
            themeMode = 'light';
        }
        return themeMode as ThemeMode;
    }

    private _getDefaultThemeForMode(themeMode: ThemeMode): Theme {
        const themeOptions = themeMode === 'light' ? defaultLightTheme() : defaultDarkTheme();
        return createMuiTheme(themeOptions);
    }

    /**
     * Helper method for setting the value of the `_themeMode` member variable.
     * Also writes the value to local storage.
     */
    private _setThemeMode(themeMode: ThemeMode): void {
        this._themeMode = themeMode;
        localStorage.setItem(ThemeService.ThemeModeKey, themeMode);
    }

}
