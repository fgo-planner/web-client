import { Nullable } from '@fgo-planner/common-core';
import { UserCredentials } from '../../types/data';
import { UserInfo } from '../../types/internal';

export abstract class AuthenticationService {

    protected _currentUser: Nullable<UserInfo>;
    /**
     * The currently logged in user's info. Is `null` if the user is not currently
     * logged in.
     */
    get currentUser() {
        return this._currentUser;
    }

    /**
     * Whether the user is logged in.
     * 
     * @deprecated No need for this, just check if the currentUser is present.
     */
    get isLoggedIn() {
        return !!this.currentUser;
    }

    abstract login(credentials: UserCredentials): Promise<void>;

    abstract logout(): Promise<void>;

}
