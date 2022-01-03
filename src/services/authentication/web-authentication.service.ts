import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { UserCredentials } from '../../types/data';
import { HttpResponseError } from '../../types/internal';
import { JwtUtils } from '../../utils/jwt.utils';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../utils/subscription/subscription-topic';
import { AuthenticationService } from './authentication.service';

@Injectable
export class WebAuthenticationService extends AuthenticationService {

    private readonly _BaseAuthenticationUrl = `${process.env.REACT_APP_REST_ENDPOINT}/auth`;

    private readonly _InvalidateCredentialsWaitDuration = 1000;

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
        return SubscribablesContainer.get(SubscriptionTopic.User_CurrentUserChange);
    }

    private _invalidatingCredentials = false;

    constructor() {
        super();
        this._loadTokenFromStorage();

        /*
         * This class is meant to last the lifetime of the application; no need to
         * unsubscribe from subscriptions.
         */
        SubscribablesContainer
            .get(SubscriptionTopic.User_Unauthorized)
            .subscribe(this._handleUnauthorizedResponse.bind(this));
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
        this._invalidateCredentials();
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

    private _invalidateCredentials(): void {
        /*
         * Set the _invalidatingCredentials flag to true.
         */
        this._invalidatingCredentials = true;
        
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

        /*
         * Reset the _invalidatingCredentials flag after the duration specified by the
         * _InvalidateCredentialsWaitDuration constant.
         */
        setTimeout(() => {
            this._invalidatingCredentials = false;
        }, this._InvalidateCredentialsWaitDuration);
    }

    private _handleUnauthorizedResponse(error: HttpResponseError): void {
        if (this._invalidatingCredentials) {
            return;
        }
        console.log('Invalidating credentials due to unauthorized response...', error);
        this._invalidateCredentials();
    }

}
