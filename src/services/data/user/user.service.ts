import { User, UserPreferences } from '@fgo-planner/types';
import { BehaviorSubject } from 'rxjs';
import { Nullable, UserInfo } from '../../../types/internal';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { AuthenticationService } from '../../authentication/auth.service';

export type BasicUser = Pick<User, '_id' | 'username' | 'email'>;

export class UserService {

    private static readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user`;

    private static _currentUserPreferences: Nullable<UserPreferences>;

    static readonly onCurrentUserPreferencesChange = new BehaviorSubject<Nullable<UserPreferences>>(null);

    /**
     * Initialization method, simulates a static constructor.
     */
    private static _initialize(): void {
        /*
         * Static subscription the the subject, unsubscribe should not be needed.
         */
        AuthenticationService.onCurrentUserChange.subscribe(this._handleCurrentUserChange.bind(this));
    }

    static async register(data: { username: string, password: string, email?: string, friendId?: string }): Promise<User> {
        const url = `${this._BaseUrl}/register`;
        return Http.post<User>(url, data, { responseType: 'text' });
    }

    static async requestPasswordReset(): Promise<User> {
        const url = `${this._BaseUrl}/request-password-reset`;
        return Http.post<User>(url, {}, { responseType: 'text' });
    }

    static async getUserPreferences(): Promise<UserPreferences> {
        const url = `${this._BaseUrl}/user-preferences`;
        return Http.get<UserPreferences>(url);
    }

    static async updateUserPreferences(userPreferences: Partial<UserPreferences>): Promise<UserPreferences> {
        const url = `${this._BaseUrl}/user-preferences`;
        const updated = await Http.post<UserPreferences>(url, userPreferences);
        this.onCurrentUserPreferencesChange.next(this._currentUserPreferences = updated);
        return updated;
    }

    static async getCurrentUser(): Promise<BasicUser> {
        const url = `${this._BaseUrl}/current-user`;
        return Http.get<BasicUser>(url);
    }

    private static async _handleCurrentUserChange(userInfo: Nullable<UserInfo>): Promise<void> {
        if (!userInfo) {
            this.onCurrentUserPreferencesChange.next(this._currentUserPreferences = null);
            return;
        }
        this._currentUserPreferences = await this.getUserPreferences();
        this.onCurrentUserPreferencesChange.next(this._currentUserPreferences);
    }

}

// Call the static initialization method.
(UserService as any)._initialize();
