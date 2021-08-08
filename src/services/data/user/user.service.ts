import { User } from '@fgo-planner/types';
import { HttpUtils as Http } from '../../../utils/http.utils';

export type BasicUser = Pick<User, '_id' | 'username' | 'email'>;

export class UserService {

    private static readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user`;

    static async register(data: { username: string, password: string, email?: string, friendId?: string }): Promise<User> {
        const url = `${this._BaseUrl}/register`;
        return Http.post<User>(url, data, { responseType: 'text' });
    }

    static async requestPasswordReset(): Promise<User> {
        const url = `${this._BaseUrl}/request-password-reset`;
        return Http.post<User>(url, {}, { responseType: 'text' });
    }

    static async getCurrentUser(): Promise<BasicUser> {
        const url = `${this._BaseUrl}/current-user`;
        return Http.get<BasicUser>(url);
    }

}
