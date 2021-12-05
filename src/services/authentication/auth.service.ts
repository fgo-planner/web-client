import { BehaviorSubject } from 'rxjs';
import { UserCredentials } from '../../types/data';
import { Nullable, UserInfo } from '../../types/internal';
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

    private static __useCookieToken: boolean;
    /**
     * Whether to use additional cookie token access token. Parsed from the
     * `REACT_APP_USE_COOKIE_ACCESS_TOKEN` property in the `.env` file. If running
     * the app in a development environment (or any other environment that is using
     * HTTP instead of HTTPS to communicate with the back-end), it is recommended to
     * set this property to `false`. Defaults to `true` if not defined.
     */
    private static get _useCookieToken() {
        if (this.__useCookieToken == null) {
            this.__useCookieToken = process.env.REACT_APP_USE_COOKIE_ACCESS_TOKEN?.toLowerCase() !== 'false';
        }
        return this.__useCookieToken;
    }

    private static _currentUser: Nullable<UserInfo>;
    /**
     * The currently logged in user's info, parsed from JWT. Is `null` if the user
     * is not currently logged in.
     */
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

        const useCookieToken = this._useCookieToken;
        if (!useCookieToken) {
            console.warn('Logging in without requesting redundant cookie access token');
        }

        const init = {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                ...credentials,
                useCookieToken
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        } as RequestInit;

        const response = await fetch(this._LoginUrl, init);

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
