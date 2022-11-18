import { Nullable } from '@fgo-planner/common-core';
import { User, UserPreferences } from '@fgo-planner/data-core';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { UserTokenPayload } from '../../../types';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';
import { BasicUser, UserService } from './user.service';

@Injectable
export class WebUserService extends UserService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user`;

    private _currentUserToken: Nullable<UserTokenPayload>;

    private _currentBasicUserPromise: Nullable<Promise<BasicUser>>;

    private get _onCurrentUserPreferencesChange() {
        return SubscribablesContainer.get(SubscriptionTopics.User.CurrentUserPreferencesChange);
    }
    
    constructor() {
        super();

        /**
         * This class is meant to last the lifetime of the application; no need to
         * unsubscribe from subscriptions.
         */
        SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentUserChange)
            .subscribe(this._handleCurrentUserChange.bind(this));
    }

    async register(data: { username: string, password: string, email?: string, friendId?: string }): Promise<User> {
        const url = `${this._BaseUrl}/register`;
        return Http.post<User>(url, data, { responseType: 'text' });
    }

    async requestPasswordReset(): Promise<User> {
        const url = `${this._BaseUrl}/request-password-reset`;
        return Http.post<User>(url, {}, { responseType: 'text' });
    }

    async getUserPreferences(): Promise<UserPreferences> {
        const url = `${this._BaseUrl}/user-preferences`;
        return Http.get<UserPreferences>(url);
    }

    async updateUserPreferences(userPreferences: Partial<UserPreferences>): Promise<UserPreferences> {
        const url = `${this._BaseUrl}/user-preferences`;
        const updated = await Http.post<UserPreferences>(url, userPreferences);
        this._onCurrentUserPreferencesChange.next(this._currentUserPreferences = updated);
        return updated;
    }

    async getCurrentUser(): Promise<Nullable<BasicUser>> {
        if (!this._currentUserToken) {
            return null;
        }
        if (!this._currentBasicUser) {
            return this._getCurrentUser();
        }
        return this._currentBasicUser;
    }

    private async _getCurrentUser(): Promise<BasicUser> {
        if (this._currentBasicUserPromise) {
            return this._currentBasicUserPromise;
        }
        const basicUserPromise = Http.get<BasicUser>(`${this._BaseUrl}/current-user`)
            .finally(() => {
                /**
                 * Must set `_currentBasicUserPromise` back to null regardless if the promise
                 * resolved successfully or with error. Otherwise the next call will return the
                 * old promise instead of making a new request.
                 */
                this._currentBasicUserPromise = null;
            });
        return this._currentBasicUserPromise = basicUserPromise;
    }

    private async _handleCurrentUserChange(userToken: Nullable<UserTokenPayload>): Promise<void> {
        this._currentUserToken = userToken;
        if (!userToken) {
            this._currentBasicUser = null;
            this._onCurrentUserPreferencesChange.next(this._currentUserPreferences = null);
            return;
        }
        try {
            this._currentBasicUser = await this._getCurrentUser();
            this._currentUserPreferences = await this.getUserPreferences();
            this._onCurrentUserPreferencesChange.next(this._currentUserPreferences);
        } catch (e: any) {
            console.error(e);
        }
    }

}
