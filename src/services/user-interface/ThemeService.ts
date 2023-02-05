import { Nullable } from '@fgo-planner/common-core';
import { UserPreferences, UserWebClientTheme } from '@fgo-planner/data-core';
import { SimplePaletteColorOptions, ThemeOptions } from '@mui/material/styles';
import { colord } from 'colord';
import { AssetConstants } from '../../constants';
import { Inject } from '../../decorators/dependency-injection/Inject.decorator';
import { Injectable } from '../../decorators/dependency-injection/Injectable.decorator';
import themeDefaultDark from '../../styles/themeDefaultDark';
import themeDefaultLight from '../../styles/themeDefaultLight';
import { ThemeInfo, ThemeMode } from '../../types';
import { LockableUIFeature } from '../../types/dto/LockableUIFeature.enum';
import { StorageKeys } from '../../utils/storage/StorageKeys';
import { StorageUtils } from '../../utils/storage/StorageUtils';
import { SubscribablesContainer } from '../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../utils/subscription/SubscriptionTopics';
import { PageMetadataService } from './PageMetadataService';
import { UserInterfaceService } from './UserInterfaceService';

type UserThemes = {
    light: ThemeInfo;
    dark: ThemeInfo;
};

@Injectable
export class ThemeService {

    @Inject(PageMetadataService)
    private readonly _pageMetadataService!: PageMetadataService;

    @Inject(UserInterfaceService)
    private readonly _userInterfaceService!: UserInterfaceService;

    private get _onThemeChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.ThemeChange);
    }

    private _themeMode: ThemeMode;

    private _currentUserThemes!: UserThemes;

    constructor() {
        this._themeMode = this._loadThemeModeFromStorage();

        const themeInfo = this._getDefaultThemeForMode(this._themeMode);
        console.log('ThemeService constructed', this._themeMode, themeInfo);

        /*
         * Set timeout here to allow the PageMetadataService to be injected first
         * before accessing it.
         */
        setTimeout(() => {
            /*
             * This access the PageMetadataService, so it has to be inside this timeout
             * function.
             */
            this._updateTheme(themeInfo);
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
        this._updateTheme(themeInfo);
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

    private _handleCurrentUserPreferencesChange(userPreferences: Nullable<UserPreferences>): void {
        this._currentUserThemes = this._loadThemesFromUserPreferences(userPreferences);
        const themeInfo = this._currentUserThemes[this._themeMode];
        this._updateTheme(themeInfo);
    }

    private _updateTheme(themeInfo: ThemeInfo): void {
        this._setThemeColorMeta(themeInfo.themeOptions);
        /**
         * Temporary disable animations on drawer so that the colors change instantly.
         */
        const lockId = this._userInterfaceService.requestLock(LockableUIFeature.NavigationDrawerNoAnimations);
        this._onThemeChange.next(themeInfo);
        /**
         * Restore animations on drawer asynchronously.
         */
        this._userInterfaceService.releaseLock(LockableUIFeature.NavigationDrawerNoAnimations, lockId);
    }

    /**
     * Sets the `theme-color` metadata.
     */
    private _setThemeColorMeta({ palette }: ThemeOptions): void {
        let color: string | undefined;
        if (palette?.drawer) {
            // TODO Add support for ColorPartial
            color = (palette.drawer as SimplePaletteColorOptions).main;
        } else {
            color = palette?.background?.default;
        }
        this._pageMetadataService.setThemeColor(color);
    }

    private _loadThemesFromUserPreferences(userPreferences: Nullable<UserPreferences>): UserThemes {
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
            themeOptions = themeDefaultLight();
        } else {
            themeOptions = themeDefaultDark();
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
            drawerColor,
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
         * Drawer color
         */
        if (drawerColor) {
            if (!palette.drawer) {
                palette.drawer = {};
            }
            (palette.drawer as SimplePaletteColorOptions).main = colord(drawerColor).toRgbString();
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
            themeOptions = themeDefaultLight();
            backgroundImageUrl = AssetConstants.DefaultLightThemeBackground;
        } else {
            themeOptions = themeDefaultDark();
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
        const drawerColor = colord((palette?.drawer as SimplePaletteColorOptions)?.main || '').toRgb();
        const primaryColor = colord((palette?.primary as SimplePaletteColorOptions)?.main || '').toRgb();
        const secondaryColor = colord((palette?.secondary as SimplePaletteColorOptions)?.main || '').toRgb();
        const dividerColor = colord(palette?.divider || '').toRgb();
        return {
            backgroundColor,
            foregroundColor,
            drawerColor,
            primaryColor,
            secondaryColor,
            dividerColor,
            backgroundImageUrl
        };
    }

}
