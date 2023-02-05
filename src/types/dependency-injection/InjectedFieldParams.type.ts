import { InjectableToken } from './InjectableToken.type';

export type InjectedFieldParams<T = any> = {
    param1: InjectableToken<T> | string;
    param2?: string;
};
