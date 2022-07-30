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
     * The local storage key where the user's access token is stored.
     */
    static readonly AccessToken = StorageKey.forStringValue(`${this._Prefix}AccessToken`, 'local');

    /**
     * The session storage key where the current master account ID is stored.
     */
    static readonly CurrentMasterAccountId = StorageKey.forStringValue(`${this._Prefix}CurrentMasterAccountId`, 'session');

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

    static readonly MasterServants = StorageKey.forObjectValue(`${this._Prefix}MasterServants`, 'local');

    private constructor() {

    }

}