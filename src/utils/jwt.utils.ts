import { UserInfo } from 'internal';
import jwt from 'jsonwebtoken';

export class JwtUtils {

    /**
     * The local storage key that contains the access token.
     */
    private static readonly AccessTokenKey = 'access_token';

    private static readonly BearerTokenPrefix = 'Bearer ';

    static readTokenFromStorage(): string | null {
        return localStorage.getItem(this.AccessTokenKey);
    }

    static writeTokenToStorage(token: string): void {
        localStorage.setItem(this.AccessTokenKey, token);
    }

    static removeTokenFromStorage(): void {
        localStorage.removeItem(this.AccessTokenKey);
    }

    /**
     * Parses user info from JWT.
     */
    static parseToken(token: string): UserInfo | null {
        if (!token) {
            return null;
        }
        if (token.startsWith(this.BearerTokenPrefix)) {
            token = token.substr(this.BearerTokenPrefix.length);
        }
        return jwt.decode(token) as UserInfo;
    }

}
