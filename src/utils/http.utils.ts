import { HttpOptions, Nullable } from '../types';
import { JwtUtils } from './jwt.utils';

type RequestBody = string | Record<string, unknown>;

export class HttpUtils {

    private static AuthorizationHeader = 'Authorization';

    private static ContentTypeHeader = 'Content-Type';

    static async get<T = any>(url: string, options?: HttpOptions): Promise<T> {
        if (options?.params) {
            url += `&${this._generateUrlParamsString(options.params)}`;
        }
        const headers = this._appendAuthorizationHeader();
        const init = {
            method: 'GET',
            headers
        };
        const response = await fetch(url, init);
        if (response.ok) {
            return response.json();
        }
        throw await response.json();
    }

    static async post<T = any>(url: string, body: RequestBody, options?: HttpOptions): Promise<T> {
        if (options?.params) {
            url += `&${this._generateUrlParamsString(options.params)}`;
        }
        const headers = {
            [this.ContentTypeHeader]: this._inferContentType(body)
        };
        this._appendAuthorizationHeader(headers);
        if (typeof body === 'object') {
            body = JSON.stringify(body);
        }
        const init = {
            method: 'POST',
            body,
            headers
        };
        const response = await fetch(url, init);
        if (response.ok) {
            return response.json();
        }
        throw await response.json();
    }

    static async put<T = any>(url: string, body: RequestBody, options?: HttpOptions): Promise<T> {
        if (options?.params) {
            url += `&${this._generateUrlParamsString(options.params)}`;
        }
        const headers = {
            [this.ContentTypeHeader]: this._inferContentType(body)
        };
        this._appendAuthorizationHeader(headers);
        if (typeof body === 'object') {
            body = JSON.stringify(body);
        }
        const init = {
            method: 'PUT',
            body,
            headers
        };
        const response = await fetch(url, init);
        if (response.ok) {
            return response.json();
        }
        throw await response.json();
    }

    static async delete<T = any>(url: string, options?: HttpOptions): Promise<T> {
        if (options?.params) {
            url += `&${this._generateUrlParamsString(options.params)}`;
        }
        const headers = this._appendAuthorizationHeader();
        const init = {
            method: 'PUT',
            headers
        };
        const response = await fetch(url, init);
        if (response.ok) {
            return response.json();
        }
        throw await response.json();
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
            headers[this.AuthorizationHeader] = token;
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

}
