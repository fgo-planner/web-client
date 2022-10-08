import { Nullable } from '@fgo-planner/common-core';
import { User, UserPreferences } from '@fgo-planner/data-core';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { UserInfo } from '../../../types/internal';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';
import { BasicUser, UserService } from './user.service';

@Injectable
export class WebUserService extends UserService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user`;

    private get _onCurrentUserPreferencesChange() {
        return SubscribablesContainer.get(SubscriptionTopics.User.CurrentUserPreferencesChange);
    }
    
    constructor() {
        super();

        /*
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
        return this._currentBasicUser;
    }

    private async _getCurrentUser(): Promise<BasicUser> {
        const url = `${this._BaseUrl}/current-user`;
        return Http.get<BasicUser>(url);
    }

    private async _handleCurrentUserChange(userInfo: Nullable<UserInfo>): Promise<void> {
        if (!userInfo) {
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
