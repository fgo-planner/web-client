import { Service } from 'typedi';
import { Theme, createMuiTheme } from '@material-ui/core';
import { BehaviorSubject } from 'rxjs';
import defaultLightTheme from '../styles/theme-default-light';
import defaultDarkTheme from '../styles/theme-default-dark';
import { ThemeMode } from 'internal';

@Service()
export class ThemeService {

    readonly onThemeChange: BehaviorSubject<Theme>;

    private _themeMode: ThemeMode;
    get themeMode() {
        return this._themeMode;
    }

    constructor() {
        const theme = createMuiTheme(defaultLightTheme());
        this._themeMode = 'light';
        this.onThemeChange = new BehaviorSubject<Theme>(theme);
    }

    toggleThemeMode() {
        let theme: Theme;
        if (this._themeMode === 'light') {
            this._themeMode = 'dark';
            theme = createMuiTheme(defaultDarkTheme());
        } else {
            this._themeMode = 'light';
            theme = createMuiTheme(defaultLightTheme());
        }
        this.onThemeChange.next(theme);
    }

}
