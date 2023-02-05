import { Nullable } from '@fgo-planner/common-core';
import { UserCredentials, UserTokenPayload } from '../../types';

export abstract class AuthenticationService {

    protected _currentUserToken: Nullable<UserTokenPayload>;
    /**
     * The currently logged in user's info. Is `null` if the user is not currently
     * logged in.
     */
    get currentUserToken() {
        return this._currentUserToken;
    }

    /**
     * Whether the user is logged in.
     * 
     * @deprecated No need for this, just check if the currentUser is present.
     */
    get isLoggedIn() {
        return !!this.currentUserToken;
    }

    abstract login(credentials: UserCredentials): Promise<void>;

    abstract logout(): Promise<void>;

}
