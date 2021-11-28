import { Nullable } from '../types/internal';
import { JwtUtils } from './jwt.utils';

type RequestBody = string | Record<string, unknown>;

// TODO Export this if needed
type HttpOptions = {
    params?: Record<string, Nullable<string | number | boolean>>;
    responseType?: HttpResponseType;
};

// TODO Export this if needed
// TODO add more types
type HttpResponseType = 'json' | 'text';

export class HttpUtils {

    private static readonly _AuthorizationHeader = 'Authorization';

    private static readonly _ContentTypeHeader = 'Content-Type';

    static async get<T = any>(url: string, options?: HttpOptions): Promise<T> {
        if (options?.params) {
            url += `&${this._generateUrlParamsString(options.params)}`;
        }
        const headers = this._appendAuthorizationHeader();
        const init = {
            method: 'GET',
            credentials: 'include',
            headers
        } as RequestInit;
        const response = await fetch(url, init);
        return this._parseResponseBody(response, options) as any;
    }

    static async post<T = any>(url: string, body: RequestBody, options?: HttpOptions): Promise<T> {
        if (options?.params) {
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
        const response = await fetch(url, init);
        return this._parseResponseBody(response, options) as any;
    }

    static async put<T = any>(url: string, body: RequestBody, options?: HttpOptions): Promise<T> {
        if (options?.params) {
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
        const response = await fetch(url, init);
        return this._parseResponseBody(response, options) as any;
    }

    static async delete<T = any>(url: string, options?: HttpOptions): Promise<T> {
        if (options?.params) {
            url += `&${this._generateUrlParamsString(options.params)}`;
        }
        const headers = this._appendAuthorizationHeader();
        const init = {
            method: 'DELETE',
            credentials: 'include',
            headers
        } as RequestInit;
        const response = await fetch(url, init);
        return this._parseResponseBody(response, options) as any;
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

    private static async _parseResponseBody(response: Response, options?: HttpOptions): Promise<string | Record<string, any>> {
        const contentType = response.headers.get(this._ContentTypeHeader);
        let inferredResponseType: HttpResponseType;
        if (response.ok && options?.responseType) {
            inferredResponseType = options.responseType;
        } else if (contentType?.includes('json')) {
            inferredResponseType = 'json';
        } else {
            inferredResponseType = 'text';
        }
        if (!response.ok) {
            const error = await this._getResponseBody(response, inferredResponseType);
            throw Error(typeof error === 'string' ? error : error['message']);
        }
        return this._getResponseBody(response, inferredResponseType);
    }

    private static async _getResponseBody(response: Response, responseType: HttpResponseType): Promise<string | Record<string, any>> {
        if (responseType === 'text') {
            return response.text();
        }
        // TODO Fallback to text if json fails.
        return response.json();
    }

}
