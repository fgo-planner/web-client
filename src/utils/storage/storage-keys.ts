import { StorageKey } from './storage-key.class';

const PrefixUser = 'User_';

const PrefixLocalUserPreference = 'LocalUserPreference_';

const PrefixLocalUserPreferenceRoute = `${PrefixLocalUserPreference}Route_`;

export class StorageKeys {

    static get User() {
        return User;
    };

    static get LocalUserPreference() {
        return LocalUserPreference;
    };

    private constructor() {

    }

}

class User {

    private static readonly _Prefix = PrefixUser;

    /**
     * Contains the user's access token.
     * 
     * Local scope
     */
    static readonly AccessToken = StorageKey.forStringValue(`${this._Prefix}AccessToken`, 'local');

    /**
     * Contains the ID of the active master account for the current tab.
     * 
     * Session scope
     */
    static readonly ActiveMasterAccountId = StorageKey.forStringValue(`${this._Prefix}ActiveMasterAccountId`, 'session');

    /**
     * Contains the ID of the master account that was active in the last focused
     * instance of the app. In addition to updating when an account is selected,
     * this should be updated every time an instance of the app is focused.
     * 
     * Local scope
     */
    static readonly LastMasterAccountId = StorageKey.forStringValue(`${this._Prefix}LastMasterAccountId`, 'local');

    private constructor() {

    }

}

class LocalUserPreference {

    private static readonly _Prefix = PrefixLocalUserPreference;

    static readonly ThemeMode = StorageKey.forStringValue(`${this._Prefix}ThemeMode`, 'local');

    static get Route() {
        return LocalUserPreferenceRoute;
    };

    private constructor() {

    }

}

class LocalUserPreferenceRoute {

    private static readonly _Prefix = PrefixLocalUserPreferenceRoute;

    static readonly MasterItemStats = StorageKey.forObjectValue(`${this._Prefix}MasterItemStats`, 'local');

    static readonly MasterServants = StorageKey.forObjectValue(`${this._Prefix}MasterServants`, 'local');

    private constructor() {

    }

}
