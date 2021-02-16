import { Service } from 'typedi';
import { User } from '../../../types';
import { HttpUtils as Http } from '../../../utils/http.utils';

@Service()
export class UserService {

    private readonly BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user`;

    async register(data: { username: string, password: string, email?: string, friendId?: string }): Promise<User> {
        const url = `${this.BaseUrl}/register`;
        return Http.post<User>(url, data, { responseType: 'text' });
    }

    async requestPasswordReset(): Promise<User> {
        const url = `${this.BaseUrl}/request-password-reset`;
        return Http.post<User>(url, {}, { responseType: 'text' });
    }

    async getCurrentUser(): Promise<User> {
        const url = `${this.BaseUrl}/current-user`;
        return Http.get<User>(url);
    }

}
