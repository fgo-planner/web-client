import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { UserCredentials } from '../../types/data';
import { JwtUtils } from '../../utils/jwt.utils';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';
import { AuthenticationService } from './authentication.service';

@Injectable
export class WebAuthenticationService extends AuthenticationService {

    private readonly _BaseAuthenticationUrl = `${process.env.REACT_APP_REST_ENDPOINT}/auth`;

    private __useCookieToken?: boolean;
    /**
     * Whether to use additional cookie token access token. Parsed from the
     * `REACT_APP_USE_COOKIE_ACCESS_TOKEN` property in the `.env` file. If running
     * the app in a development environment (or any other environment that is using
     * HTTP instead of HTTPS to communicate with the back-end), it is recommended to
     * set this property to `false`. Defaults to `true` if not defined.
     */
    private get _useCookieToken() {
        if (this.__useCookieToken === undefined) {
            this.__useCookieToken = process.env.REACT_APP_USE_COOKIE_ACCESS_TOKEN?.toLowerCase() !== 'false';
        }
        return this.__useCookieToken;
    }

    private get _onCurrentUserChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserCurrentUserChange);
    }

    constructor() {
        super();
        this._loadTokenFromStorage();
    }

    async login(credentials: UserCredentials): Promise<void> {
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

        const response = await fetch(`${this._BaseAuthenticationUrl}/login`, init);

        if (response.status === 200) {
            const token = await response.text();
            JwtUtils.writeTokenToStorage(token);
            this._currentUser = JwtUtils.parseToken(token);
            this._onCurrentUserChange.next(this._currentUser);
        } else {
            throw await response.text();
        }
    }

    async logout(): Promise<void> {
        /*
         * Remove the access token from local storage and set current user to null.
         */
        JwtUtils.removeTokenFromStorage();
        this._currentUser = null;
        this._onCurrentUserChange.next(null);

        /*
         * Currently the status of this request doesn't matter...it is only used to
         * clear the cookie access token. As long as the local storage token is removed,
         * the app will recognize that the user is no longer logged in.
         */
        fetch(`${this._BaseAuthenticationUrl}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    }

    /**
     * Loads user info from JWT in local storage.
     */
    private _loadTokenFromStorage(): void {
        const token = JwtUtils.readTokenFromStorage();
        if (token) {
            this._currentUser = JwtUtils.parseToken(token);
            this._onCurrentUserChange.next(this._currentUser);
        }
    }

}