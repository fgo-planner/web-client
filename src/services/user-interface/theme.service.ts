import { UserPreferences, UserWebClientTheme } from '@fgo-planner/types';
import { DeprecatedThemeOptions } from '@mui/material';
import { SimplePaletteColorOptions } from '@mui/material/styles';
import { colord } from 'colord';
import { BehaviorSubject } from 'rxjs';
import { AssetConstants } from '../../constants';
import defaultDarkTheme from '../../styles/theme-default-dark';
import defaultLightTheme from '../../styles/theme-default-light';
import { Nullable } from '../../types/internal';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';
import { PageMetadataService } from './page-metadata.service';

export type ThemeMode = 'light' | 'dark';

export type ThemeInfo = {
    themeOptions: DeprecatedThemeOptions;
    themeMode: ThemeMode;
    backgroundImageUrl?: string;
};

type UserThemes = {
    light: ThemeInfo;
    dark: ThemeInfo;
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

    private static _currentUserThemes: UserThemes;

    /**
     * Initialization method, simulates a static constructor.
     */
    private static _initialize(): void {
        const themeMode = this._themeMode = this._loadThemeModeFromStorage();

        const themeInfo = this._getDefaultThemeForMode(themeMode);
        this._setThemeColorMeta(themeInfo.themeOptions);
        this._onThemeChange = new BehaviorSubject<ThemeInfo>(themeInfo);

        /*
         * This class is meant to last the lifetime of the application; no need to
         * unsubscribe from subscriptions.
         */
        SubscribablesContainer
            .get(SubscriptionTopics.UserCurrentUserPreferencesChange)
            .subscribe(this._handleCurrentUserPreferencesChange.bind(this));
    }

    static toggleThemeMode(): void {
        if (this._themeMode === 'light') {
            this._setThemeMode('dark');
        } else {
            this._setThemeMode('light');
        }
        const themeInfo = this._currentUserThemes[this._themeMode];
        this._setThemeColorMeta(themeInfo.themeOptions);
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
    private static _setThemeColorMeta(themeOptions: DeprecatedThemeOptions): void {
        PageMetadataService.setThemeColor(themeOptions?.palette?.background?.default);
    }

    private static async _handleCurrentUserPreferencesChange(userPreferences: Nullable<UserPreferences>): Promise<void> {
        this._currentUserThemes = this._loadThemesForCurrentUser(userPreferences);
        const themeInfo = this._currentUserThemes[this._themeMode];
        this._onThemeChange.next(themeInfo);
    }

    private static _loadThemesForCurrentUser(userPreferences: Nullable<UserPreferences>): UserThemes {
        let light: ThemeInfo;
        let dark: ThemeInfo;
        const userThemePreferences = userPreferences?.webClient?.themes;
        if (!userThemePreferences) {
            light = this._getDefaultThemeForMode('light');
            dark = this._getDefaultThemeForMode('dark');
        } else {
            light = this._parseUserThemePreference(userThemePreferences.light, 'light');
            dark = this._parseUserThemePreference(userThemePreferences.dark, 'dark');
        }
        return { light, dark };
    }

    /**
     * Converts the user's custom theme settings into a `ThemeOptions` object.
     */
    private static _parseUserThemePreference(userThemePreference: UserWebClientTheme | undefined, themeMode: ThemeMode): ThemeInfo {
        let themeOptions: DeprecatedThemeOptions;
        /*
         * The theme options starts off with default values as the base. Any values that
         * are not specified by the user in the custom theme will use the default.
         */
        if (themeMode === 'light') {
            themeOptions = defaultLightTheme();
        } else {
            themeOptions = defaultDarkTheme();
        }
        /*
         * Update the default theme options with the user specified values.
         */
        if (userThemePreference) {
            this._mergeThemeOptions(themeOptions, userThemePreference);
        }

        let backgroundImageUrl;
        if (userThemePreference) {
            /*
             * Unlike the theme options, the background image will not use a default value
             * if the user is using a custom theme.
             */
            backgroundImageUrl = userThemePreference.backgroundImageUrl;
        } else if (themeMode === 'light') {
            backgroundImageUrl = AssetConstants.DefaultLightThemeBackground;
        } else {
            backgroundImageUrl = AssetConstants.DefaultDarkThemeBackground;
        }

        return { themeOptions, themeMode, backgroundImageUrl };
    }

    private static _mergeThemeOptions(baseThemeOptions: DeprecatedThemeOptions, userThemePreference: UserWebClientTheme): void {
        const {
            backgroundColor,
            foregroundColor,
            primaryColor,
            secondaryColor,
            dividerColor
        } = userThemePreference;

        if (!baseThemeOptions.palette) {
            baseThemeOptions.palette = {};
        }
        const { palette } = baseThemeOptions;

        /*
         * Background colors
         */
        if (!palette.background) {
            palette.background = {};
        }
        const background = palette.background;
        if (backgroundColor) {
            background.default = colord(backgroundColor).toRgbString();
        }
        if (foregroundColor) {
            background.paper = colord(foregroundColor).toRgbString();
        }

        /*
         * Primary color
         */
        if (primaryColor) {
            if (!palette.primary) {
                palette.primary = {};
            }
            (palette.primary as SimplePaletteColorOptions).main = colord(primaryColor).toRgbString();
        }

        /*
         * Secondary color
         */
        if (secondaryColor) {
            if (!palette.secondary) {
                palette.secondary = {};
            }
            (palette.secondary as SimplePaletteColorOptions).main = colord(secondaryColor).toRgbString();
        }

        /*
         * Divider color
         */
        if (dividerColor) {
            palette.divider = colord(dividerColor).toRgbString();
        }

    }

    private static _getDefaultThemeForMode(themeMode: ThemeMode): ThemeInfo {
        let themeOptions: DeprecatedThemeOptions;
        let backgroundImageUrl: string;
        if (themeMode === 'light') {
            themeOptions = defaultLightTheme();
            backgroundImageUrl = AssetConstants.DefaultLightThemeBackground;
        } else {
            themeOptions = defaultDarkTheme();
            backgroundImageUrl = AssetConstants.DefaultDarkThemeBackground;
        }
        return { themeOptions, themeMode, backgroundImageUrl };
    }

    /**
     * Gets the default theme in the form of a `UserWebClientTheme`. A new instance
     * of the theme is returned every time this is called, so the returned object
     * can be modified without any side effects. Useful when creating new accounts
     * and to backfill older accounts that don't have theme data.
     */
    static getDefaultUserWebClientTheme(themeMode: ThemeMode): UserWebClientTheme {
        const { themeOptions, backgroundImageUrl } = this._getDefaultThemeForMode(themeMode);
        const { palette } = themeOptions;
        const backgroundColor = colord(palette?.background?.default || '').toRgb();
        const foregroundColor = colord(palette?.background?.paper || '').toRgb();
        const primaryColor = colord((palette?.primary as SimplePaletteColorOptions)?.main || '').toRgb();
        const secondaryColor = colord((palette?.secondary as SimplePaletteColorOptions)?.main || '').toRgb();
        const dividerColor = colord(palette?.divider || '').toRgb();
        return {
            backgroundColor,
            foregroundColor,
            primaryColor,
            secondaryColor,
            dividerColor,
            backgroundImageUrl
        };
    }

}

// Call the static initialization method.
(ThemeService as any)._initialize();
