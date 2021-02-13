import { Nullable } from './generics/nullable.type';

export type HttpOptions = {

    params?: Record<string, Nullable<string | number | boolean>>;

};
