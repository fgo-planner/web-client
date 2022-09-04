import { EntityWithTimestamps } from '@fgo-planner/data-types';
import { Function, HttpOptions, HttpResponseError, HttpResponseType, Nullable } from '../types/internal';
import { JwtUtils } from './jwt.utils';
import { SubscribablesContainer } from './subscription/subscribables-container';
import { SubscriptionTopics } from './subscription/subscription-topics';

type RequestBody = string | Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/ban-types
type TransformFunc<T> = Function<any, T>;

export class HttpUtils {

    private static readonly _AuthorizationHeader = 'Authorization';

    private static readonly _ContentTypeHeader = 'Content-Type';

    private static get _onUnauthorized() {
        return SubscribablesContainer.get(SubscriptionTopics.User.Unauthorized);
    }

    private constructor () {
        
    }

    //#region HTTP request methods

    static async get<T = any>(url: string): Promise<T>;
    static async get<T = any>(url: string, options: HttpOptions): Promise<T>;
    static async get<T = any>(url: string, transformFunc: TransformFunc<T>): Promise<T>;
    static async get<T = any>(url: string, options: HttpOptions, transformFunc: TransformFunc<T>): Promise<T>;
    static async get<T = any>(url: string, arg1?: HttpOptions | TransformFunc<T>, arg2?: TransformFunc<T>): Promise<T> {
        const { options, transformFunc } = this._parseArgs(arg1, arg2);
        if (options.params) {
            url += `&${this._generateUrlParamsString(options.params)}`;
        }
        const headers = this._appendAuthorizationHeader();
        const init = {
            method: 'GET',
            credentials: 'include',
            headers
        } as RequestInit;
        const response = await this._fetch(url, init);
        return this._parseResponseBody<T>(response, options, transformFunc) as any;
    }

    static async post<T = any>(url: string, body: RequestBody): Promise<T>;
    static async post<T = any>(url: string, body: RequestBody, options: HttpOptions): Promise<T>;
    static async post<T = any>(url: string, body: RequestBody, transformFunc: TransformFunc<T>): Promise<T>;
    static async post<T = any>(url: string, body: RequestBody, options: HttpOptions, transformFunc: TransformFunc<T>): Promise<T>;
    static async post<T = any>(url: string, body: RequestBody, arg1?: HttpOptions | TransformFunc<T>, arg2?: TransformFunc<T>): Promise<T> {
        const { options, transformFunc } = this._parseArgs(arg1, arg2);
        if (options.params) {
            url += `&${this._generateUrlParamsString(options.params)}`;
        }
        const headers = {
            [this._ContentTypeHeader]: this._inferContentType(body)
        };
        this._appendAuthorizationHeader(headers);
        if (typeof body === 'object') {
            body = JSON.stringify(body);
        }
        const init = {
            method: 'POST',
            credentials: 'include',
            body,
            headers
        } as RequestInit;
        const response = await this._fetch(url, init);
        return this._parseResponseBody(response, options, transformFunc) as any;
    }

    static async put<T = any>(url: string, body: RequestBody): Promise<T>;
    static async put<T = any>(url: string, body: RequestBody, options: HttpOptions): Promise<T>;
    static async put<T = any>(url: string, body: RequestBody, transformFunc: TransformFunc<T>): Promise<T>;
    static async put<T = any>(url: string, body: RequestBody, options: HttpOptions, transformFunc: TransformFunc<T>): Promise<T>;
    static async put<T = any>(url: string, body: RequestBody, arg1?: HttpOptions | TransformFunc<T>, arg2?: TransformFunc<T>): Promise<T> {
        const { options, transformFunc } = this._parseArgs(arg1, arg2);
        if (options.params) {
            url += `&${this._generateUrlParamsString(options.params)}`;
        }
        const headers = {
            [this._ContentTypeHeader]: this._inferContentType(body)
        };
        this._appendAuthorizationHeader(headers);
        if (typeof body === 'object') {
            body = JSON.stringify(body);
        }
        const init = {
            method: 'PUT',
            credentials: 'include',
            body,
            headers
        } as RequestInit;
        const response = await this._fetch(url, init);
        return this._parseResponseBody(response, options, transformFunc) as any;
    }

    static async delete<T = any>(url: string): Promise<T>;
    static async delete<T = any>(url: string, options: HttpOptions): Promise<T>;
    static async delete<T = any>(url: string, transformFunc: TransformFunc<T>): Promise<T>;
    static async delete<T = any>(url: string, options: HttpOptions, transformFunc: TransformFunc<T>): Promise<T>;
    static async delete<T = any>(url: string, arg1?: HttpOptions | TransformFunc<T>, arg2?: TransformFunc<T>): Promise<T> {
        const { options, transformFunc } = this._parseArgs(arg1, arg2);
        if (options.params) {
            url += `&${this._generateUrlParamsString(options.params)}`;
        }
        const headers = this._appendAuthorizationHeader();
        const init = {
            method: 'DELETE',
            credentials: 'include',
            headers
        } as RequestInit;
        const response = await this._fetch(url, init);
        return this._parseResponseBody(response, options, transformFunc) as any;
    }

    private static _inferContentType(body: RequestBody): string {
        if (typeof body === 'object') {
            return 'application/json';
        }
        return 'text/plain';
    }

    private static _appendAuthorizationHeader(headers: Record<string, string> = {}): Record<string, string> {
        const token = JwtUtils.readTokenFromStorage();
        if (token !== null) {
            headers[this._AuthorizationHeader] = token;
        }
        return headers;
    }

    private static _generateUrlParamsString(params: Record<string, Nullable<string | number | boolean>>): string {
        const urlParams = new URLSearchParams();
        for (const key in params) {
            let value = params[key];
            if (value == null) {
                continue;
            }
            if (typeof value !== 'string') {
                value = String(value);
            }
            urlParams.append(key, value);
        }
        return urlParams.toString();
    }

    private static async _fetch(url: string, init: RequestInit): Promise<Response> {
        try {
            return await fetch(url, init);
        } catch (e: any) {
            // TODO Handle fetch error here.
            throw e;
        }
    }

    private static async _parseResponseBody<T>(
        response: Response, 
        options: HttpOptions, 
        transformFunc?: TransformFunc<T>
    ): Promise<string | T> {

        const contentType = response.headers.get(this._ContentTypeHeader);
        const { responseType, ignoreUnauthorized } = options;
        let inferredResponseType: HttpResponseType;
        if (response.ok && responseType) {
            inferredResponseType = responseType;
        } else if (contentType?.includes('json')) {
            inferredResponseType = 'json';
        } else {
            inferredResponseType = 'text';
        }
        if (!response.ok) {
            const error = await this._parseResponseError(response, inferredResponseType);
            if (this._isUnauthorizedError(error) && !ignoreUnauthorized) {
                this._notifyUnauthorizedError(error);
            }
            throw error;
        }
        const body = await this._getResponseBody<T>(response, inferredResponseType);
        if (!transformFunc) {
            return body;
        }
        return transformFunc(body);
    }

    private static async _getResponseBody<T = any>(response: Response, responseType: HttpResponseType): Promise<string | T> {
        if (responseType === 'text') {
            return response.text();
        }
        // TODO Fallback to text if json fails.
        return response.json();
    }

    private static async _parseResponseError(response: Response, responseType: HttpResponseType): Promise<HttpResponseError> {
        const body = await this._getResponseBody(response, responseType);
        const message = typeof body === 'string' ? body : body['message'];

        return {
            status: response.status,
            statusText: response.statusText,
            message,
        };
    }

    private static _isUnauthorizedError({ status }: HttpResponseError): boolean {
        return status === 401 || status === 403;
    }

    private static _notifyUnauthorizedError(error: HttpResponseError): void {
        this._onUnauthorized.next(error);
    }

    private static _parseArgs<T>(
        arg1?: HttpOptions | TransformFunc<T>,
        arg2?: TransformFunc<T>
    ): { options: HttpOptions, transformFunc?: TransformFunc<T> } {

        let options: HttpOptions = {};
        let transformFunc: TransformFunc<T> | undefined = undefined;
        
        if (typeof arg1 === 'object') {
            options = arg1;
            transformFunc = arg2;
        } else if (typeof arg1 === 'function') {
            transformFunc = arg1;
        } 

        return { options, transformFunc };
    }

    //#endregion


    //#region HTTP response methods
    
    /**
     * Converts the string values of response entity timestamps fields (`createdAt`
     * and `updatedAt`) into `Date` values.
     */
    static stringTimestampsToDate<T extends EntityWithTimestamps<ID>, ID>(entity: T): T;
    /**
     * Converts the string values of response entity timestamps fields (`createdAt`
     * and `updatedAt`) into `Date` values.
     */
    static stringTimestampsToDate<T extends EntityWithTimestamps<ID>, ID>(entities: Array<T>): Array<T>;
    static stringTimestampsToDate<T extends EntityWithTimestamps<ID>, ID>(entity: T | Array<T>): T | Array<T> {
        if (Array.isArray(entity)) {
            entity.forEach(this._stringTimestampsToDate);
            return entity;
        } else {
            return this._stringTimestampsToDate(entity);
        }
    }
    
    private static _stringTimestampsToDate<T extends EntityWithTimestamps<ID>, ID>(entity: T): T {
        if (entity.createdAt) {
            entity.createdAt = new Date(entity.createdAt);
        }
        if (entity.updatedAt) {
            entity.updatedAt = new Date(entity.updatedAt);
        }
        return entity;
    }

    //#endregion

}

//#region Bind static functions

HttpUtils.stringTimestampsToDate = HttpUtils.stringTimestampsToDate.bind(HttpUtils);

//#endregion
