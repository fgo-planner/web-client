import { InjectableToken } from './injectable-token.type';

export type InjectedField<T = any> = {
    field: string;
} & InjectedFieldParams<T>;

export type InjectedFieldParams<T = any> = {
    param1: InjectableToken<T> | string;
    param2?: string;
};
