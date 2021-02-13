import { Service } from 'typedi';
import { User } from '../../../types';
import { HttpUtils as Http } from '../../../utils/http.utils';

@Service()
export class UserService {

    private readonly BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user`;

    async getCurrentUser(): Promise<User> {
        return Http.get<User>(`${this.BaseUrl}/current-user`);
    }

}
