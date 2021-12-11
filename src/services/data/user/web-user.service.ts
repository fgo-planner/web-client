import { User, UserPreferences } from '@fgo-planner/types';
import { Inject } from '../../../decorators/dependency-injection/inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { Nullable, UserInfo } from '../../../types/internal';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { AuthenticationService } from '../../authentication/authentication.service';
import { BasicUser, UserService } from './user.service';

@Injectable
export class WebUserService extends UserService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user`;

    @Inject(AuthenticationService)
    private readonly _authenticationService!: AuthenticationService;

    constructor() {
        super();

        // TODO Move subjects to a centralized container.
        setTimeout(() => {
            /*
             * Static subscription the the subject, unsubscribe should not be needed.
             */
            console.log(this._authenticationService);
            this._authenticationService.onCurrentUserChange.subscribe(this._handleCurrentUserChange.bind(this));
        });
        
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
        this.onCurrentUserPreferencesChange.next(this._currentUserPreferences = updated);
        return updated;
    }

    async getCurrentUser(): Promise<BasicUser> {
        const url = `${this._BaseUrl}/current-user`;
        return Http.get<BasicUser>(url);
    }
    
    private async _handleCurrentUserChange(userInfo: Nullable<UserInfo>): Promise<void> {
        if (!userInfo) {
            this.onCurrentUserPreferencesChange.next(this._currentUserPreferences = null);
            return;
        }
        this._currentUserPreferences = await this.getUserPreferences();
        this.onCurrentUserPreferencesChange.next(this._currentUserPreferences);
    }

}
