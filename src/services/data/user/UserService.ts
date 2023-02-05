import { Nullable } from '@fgo-planner/common-core';
import { User, UserPreferences } from '@fgo-planner/data-core';

export type BasicUser = Pick<User, '_id' | 'username' | 'email'>;

export abstract class UserService {

    protected _currentBasicUser: Nullable<BasicUser>;

    protected _currentUserPreferences: Nullable<UserPreferences>;

    abstract register(data: { username: string, password: string, email?: string, friendId?: string }): Promise<User>;

    abstract requestPasswordReset(): Promise<User>;

    abstract getUserPreferences(): Promise<UserPreferences>;

    abstract updateUserPreferences(userPreferences: Partial<UserPreferences>): Promise<UserPreferences>;

    abstract getCurrentUser(): Promise<Nullable<BasicUser>>;

}
