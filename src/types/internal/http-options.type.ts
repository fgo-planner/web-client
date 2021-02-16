import { Nullable } from './generics/nullable.type';
import { HttpResponseType } from './http-response-type.type';

export type HttpOptions = {

    params?: Record<string, Nullable<string | number | boolean>>;

    responseType?: HttpResponseType;

};
