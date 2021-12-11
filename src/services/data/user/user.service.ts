import { User, UserPreferences } from '@fgo-planner/types';
import { BehaviorSubject } from 'rxjs';
import { Nullable } from '../../../types/internal';

export type BasicUser = Pick<User, '_id' | 'username' | 'email'>;

export abstract class UserService {

    protected _currentUserPreferences: Nullable<UserPreferences>;

    // TODO Move subjects to a centralized container.
    private static readonly _onCurrentUserPreferencesChange = new BehaviorSubject<Nullable<UserPreferences>>(null);
    get onCurrentUserPreferencesChange() {
        return UserService._onCurrentUserPreferencesChange;
    }

    abstract register(data: { username: string, password: string, email?: string, friendId?: string }): Promise<User>;

    abstract requestPasswordReset(): Promise<User>;

    abstract getUserPreferences(): Promise<UserPreferences>;

    abstract updateUserPreferences(userPreferences: Partial<UserPreferences>): Promise<UserPreferences>;

    abstract getCurrentUser(): Promise<BasicUser>;

}
