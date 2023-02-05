import { StorageKey } from './StorageKey';

const PrefixUser = 'User_';

const PrefixLocalUserPreference = 'LocalUserPreference_';

const PrefixLocalUserPreferenceRoute = `${PrefixLocalUserPreference}Route_`;

const User = {

    /**
     * Contains the user's access token.
     * 
     * Local scope
     */
    AccessToken: StorageKey.forStringValue(`${PrefixUser}AccessToken`, 'local'),

    /**
     * Contains the ID of the active master account for the current tab.
     * 
     * Session scope
     */
    ActiveMasterAccountId: StorageKey.forStringValue(`${PrefixUser}ActiveMasterAccountId`, 'session'),

    /**
     * Contains the ID of the master account that was active in the last focused
     * instance of the app. In addition to updating when an account is selected,
     * this should be updated every time an instance of the app is focused.
     * 
     * Local scope
     */
    LastMasterAccountId: StorageKey.forStringValue(`${PrefixUser}LastMasterAccountId`, 'local')

} as const;

const LocalUserPreference = {

    ThemeMode: StorageKey.forStringValue(`${PrefixLocalUserPreference}ThemeMode`, 'local'),

    Route: {

        MasterItemStats: StorageKey.forObjectValue(`${PrefixLocalUserPreferenceRoute}MasterItemStats`, 'local'),

        MasterServants: StorageKey.forObjectValue(`${PrefixLocalUserPreferenceRoute}MasterServants`, 'local'),

        Plan: StorageKey.forObjectValue(`${PrefixLocalUserPreferenceRoute}Plan`, 'local')

    }

} as const;


export const StorageKeys = {
    User,
    LocalUserPreference
} as const;
