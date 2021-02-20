import { BehaviorSubject } from 'rxjs';
import { Nullable, UserCredentials, UserInfo } from '../../types';
import { JwtUtils } from '../../utils/jwt.utils';

export class AuthenticationService {

    private static readonly _LoginUrl = `${process.env.REACT_APP_REST_ENDPOINT}/login`;

    private static _onCurrentUserChange?: BehaviorSubject<Nullable<UserInfo>>;
    static get onCurrentUserChange() {
        if (!this._onCurrentUserChange) {
            this._loadTokenFromStorage();
            this._onCurrentUserChange = new BehaviorSubject<Nullable<UserInfo>>(this._currentUser);
        }
        return this._onCurrentUserChange;
    }

    /**
     * Cached copy of user info parsed from JWT.
     */
    private static _currentUser: Nullable<UserInfo>;
    static get currentUser() {
        if (!this._currentUser) {
            this._loadTokenFromStorage();
        }
        return this._currentUser;
    }

    /**
     * Whether the user is logged in.
     */
    static get isLoggedIn() {
        return !!this.currentUser;
    }

    static async login(credentials: UserCredentials): Promise<void> {
        const options = {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(this._LoginUrl, options);
        if (response.status === 200) {
            const token = await response.text();
            JwtUtils.writeTokenToStorage(token);
            this._currentUser = JwtUtils.parseToken(token);
            this.onCurrentUserChange.next(this._currentUser);
        } else {
            throw await response.text();
        }
    }

    static logout() {
        JwtUtils.removeTokenFromStorage();
        this._currentUser = null;
        this.onCurrentUserChange.next(null);
    }

    /**
     * Loads user info from JWT in local storage.
     */
    private static _loadTokenFromStorage(): void {
        const token = JwtUtils.readTokenFromStorage();
        if (token) {
            this._currentUser = JwtUtils.parseToken(token);
            this._onCurrentUserChange?.next(this._currentUser);
        }
    }

}
