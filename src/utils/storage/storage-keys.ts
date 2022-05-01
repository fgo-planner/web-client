import { StorageKey } from './storage-key.class';

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

    private static readonly _Prefix = 'User';

    /**
     * The local storage key where the user's access token is stored.
     */
    static readonly AccessToken = StorageKey.forStringValue(`${this._Prefix}_AccessToken`, 'local');

    /**
     * The session storage key where the current master account ID is stored.
     */
    static readonly CurrentMasterAccountId = StorageKey.forStringValue(`${this._Prefix}_CurrentMasterAccountId`, 'session');

    private constructor() {

    }

}

class LocalUserPreference {

    private static readonly _Prefix = 'LocalUserPreference';

    static readonly ThemeMode = StorageKey.forStringValue(`${this._Prefix}_ThemeMode`, 'local');

    private constructor() {

    }

}
