import { UserPreferences, UserWebClientTheme } from '@fgo-planner/types';
import { SimplePaletteColorOptions, ThemeOptions } from '@mui/material/styles';
import { colord } from 'colord';
import { AssetConstants } from '../../constants';
import { Inject } from '../../decorators/dependency-injection/inject.decorator';
import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import defaultDarkTheme from '../../styles/theme-default-dark';
import defaultLightTheme from '../../styles/theme-default-light';
import { Nullable, ThemeInfo, ThemeMode } from '../../types/internal';
import { StorageKeys } from '../../utils/storage/storage-keys';
import { StorageUtils } from '../../utils/storage/storage.utils';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';
import { PageMetadataService } from './page-metadata.service';

type UserThemes = {
    light: ThemeInfo;
    dark: ThemeInfo;
};

@Injectable
export class ThemeService {

    @Inject(PageMetadataService)
    private readonly _pageMetadataService!: PageMetadataService;

    private get _onThemeChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.ThemeChange);
    }

    private _themeMode: ThemeMode;

    private _currentUserThemes!: UserThemes;

    constructor() {
        this._themeMode = this._loadThemeModeFromStorage();

        const themeInfo = this._getDefaultThemeForMode(this._themeMode);
        console.log('ThemeService constructed', this._themeMode, themeInfo);
        this._onThemeChange.next(themeInfo);

        /*
         * Set timeout here to allow the PageMetadataService to be injected first
         * before accessing it in the subscription handler.
         */
        setTimeout(() => {
            /*
             * This class is meant to last the lifetime of the application; no need to
             * unsubscribe from subscriptions.
             */
            SubscribablesContainer
                .get(SubscriptionTopics.User.CurrentUserPreferencesChange)
                .subscribe(this._handleCurrentUserPreferencesChange.bind(this));
        });
    }

    toggleThemeMode(): void {
        if (this._themeMode === 'light') {
            this._setThemeMode('dark');
        } else {
            this._setThemeMode('light');
        }
        const themeInfo = this._currentUserThemes[this._themeMode];
        this._setThemeColorMeta(themeInfo.themeOptions);
        this._onThemeChange.next(themeInfo);
    }

    private _loadThemeModeFromStorage(): ThemeMode {
        let themeMode = StorageUtils.getItem(StorageKeys.LocalUserPreference.ThemeMode);
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
    private _setThemeMode(themeMode: ThemeMode): void {
        this._themeMode = themeMode;
        StorageUtils.setItem(StorageKeys.LocalUserPreference.ThemeMode, themeMode);
    }

    private async _handleCurrentUserPreferencesChange(userPreferences: Nullable<UserPreferences>): Promise<void> {
        this._currentUserThemes = this._loadThemesForCurrentUser(userPreferences);
        const themeInfo = this._currentUserThemes[this._themeMode];
        this._setThemeColorMeta(themeInfo.themeOptions);
        this._onThemeChange.next(themeInfo);
    }

    /**
     * Sets the `theme-color` metadata.
     */
    private _setThemeColorMeta(themeOptions: ThemeOptions): void {
        this._pageMetadataService.setThemeColor(themeOptions.palette?.background?.default);
    }

    private _loadThemesForCurrentUser(userPreferences: Nullable<UserPreferences>): UserThemes {
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
    private _parseUserThemePreference(userThemePreference: UserWebClientTheme | undefined, themeMode: ThemeMode): ThemeInfo {
        let themeOptions: ThemeOptions;
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

    private _mergeThemeOptions(baseThemeOptions: ThemeOptions, userThemePreference: UserWebClientTheme): void {
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

    private _getDefaultThemeForMode(themeMode: ThemeMode): ThemeInfo {
        let themeOptions: ThemeOptions;
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
    getDefaultUserWebClientTheme(themeMode: ThemeMode): UserWebClientTheme {
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
