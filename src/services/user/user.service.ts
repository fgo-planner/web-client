import { User } from 'data';
import { Service } from 'typedi';
import { HttpUtils as Http } from 'utils';

@Service()
export class UserService {

    private readonly BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user`;

    async getCurrentUser(): Promise<User> {
        return Http.get<User>(`${this.BaseUrl}/current-user`);
    }

}
