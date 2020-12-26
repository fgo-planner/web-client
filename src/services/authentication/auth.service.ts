import { Nullable, UserCredentials, UserInfo } from 'internal';
import { BehaviorSubject } from 'rxjs';
import { Service } from 'typedi';
import { JwtUtils } from 'utils';

@Service()
export class AuthService {

    private readonly LoginUrl = `${process.env.REACT_APP_REST_ENDPOINT}/login`;

    readonly onCurrentUserChange: BehaviorSubject<Nullable<UserInfo>>;

    /**
     * Cached copy of user info parsed from JWT.
     */
    private _currentUser: Nullable<UserInfo>;
    get currentUser() {
        if (!this._currentUser) {
            this._loadTokenFromStorage();
        }
        return this._currentUser;
    }

    /**
     * Whether the user is logged in.
     */
    get isLoggedIn() {
        return !!this.currentUser;
    }

    constructor() {
        this._loadTokenFromStorage();
        this.onCurrentUserChange = new BehaviorSubject<Nullable<UserInfo>>(this._currentUser);
    }

    async login(credentials: UserCredentials): Promise<void> {
        const options = {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(this.LoginUrl, options);
        if (response.status === 200) {
            const token = await response.text();
            JwtUtils.writeTokenToStorage(token);
            this._currentUser = JwtUtils.parseToken(token);
            this.onCurrentUserChange.next(this._currentUser);
        } else {
            throw await response.text();
        }
    }

    logout() {
        JwtUtils.removeTokenFromStorage();
        this._currentUser = null;
        this.onCurrentUserChange.next(null);
    }

    /**
     * Loads user info from JWT in local storage.
     */
    private _loadTokenFromStorage() {
        const token = JwtUtils.readTokenFromStorage();
        if (token) {
            this._currentUser = JwtUtils.parseToken(token);
            this.onCurrentUserChange?.next(this._currentUser);
        }
    }

}
