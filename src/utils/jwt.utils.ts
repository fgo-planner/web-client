import jwt from 'jsonwebtoken';
import { UserInfo } from '../types/internal';
import { StorageKeys } from './storage/storage-keys';
import { StorageUtils } from './storage/storage.utils';

export class JwtUtils {

    private static readonly BearerTokenPrefix = 'Bearer ';

    private constructor() {
        
    }

    static readTokenFromStorage(): string | null {
        return StorageUtils.getItem(StorageKeys.User.AccessToken);
    }

    static writeTokenToStorage(token: string): void {
        StorageUtils.setItem(StorageKeys.User.AccessToken, token);
    }

    static removeTokenFromStorage(): void {
        StorageUtils.removeItem(StorageKeys.User.AccessToken);
    }

    /**
     * Parses user info from JWT.
     */
    static parseToken(token: string): UserInfo | null {
        if (!token) {
            return null;
        }
        if (token.startsWith(this.BearerTokenPrefix)) {
            token = token.substring(this.BearerTokenPrefix.length);
        }
        return jwt.decode(token) as UserInfo;
    }

}
