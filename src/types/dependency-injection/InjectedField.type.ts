import { InjectedFieldParams } from './InjectedFieldParams.type';

export type InjectedField<T = any> = {
    field: string;
} & InjectedFieldParams<T>;
