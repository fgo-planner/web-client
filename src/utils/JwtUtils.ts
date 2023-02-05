import jwt from 'jsonwebtoken';
import { UserTokenPayload } from '../types';
import { StorageKeys } from './storage/StorageKeys';
import { StorageUtils } from './storage/StorageUtils';

export namespace JwtUtils {

    const BearerTokenPrefix = 'Bearer ';

    export function readTokenFromStorage(): string | null {
        return StorageUtils.getItem(StorageKeys.User.AccessToken);
    }

    export function writeTokenToStorage(token: string): void {
        StorageUtils.setItem(StorageKeys.User.AccessToken, token);
    }

    export function removeTokenFromStorage(): void {
        StorageUtils.removeItem(StorageKeys.User.AccessToken);
    }

    /**
     * Parses user info from JWT.
     */
    export function parseToken(token: string): UserTokenPayload | null {
        if (!token) {
            return null;
        }
        if (token.startsWith(BearerTokenPrefix)) {
            token = token.substring(BearerTokenPrefix.length);
        }
        return jwt.decode(token) as UserTokenPayload;
    }

}    
