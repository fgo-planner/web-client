import { Entity } from '../entity.type';
import { UserPreferences } from './user-preferences.type';

export type User = Entity<string> & {

    username: string;

    hash?: string;

    email?: string;

    admin?: boolean;

    enabled: boolean;

    userPrefs: UserPreferences;
    
};
