import { Nullable } from '@fgo-planner/common-core';
import { HttpResponseType } from './HttpResponseType.type';

export type HttpOptions = {
    
    params?: Record<string, Nullable<string | number | boolean>>;

    responseType?: HttpResponseType;

    /**
     * Whether to bypass automatic handling of unauthorized and related (401, 403,
     * etc.) error codes.
     */
    ignoreUnauthorized?: boolean;

};
