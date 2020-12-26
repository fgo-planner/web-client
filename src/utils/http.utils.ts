import { JwtUtils } from './jwt.utils';

export class HttpUtils {

    private static AuthorizationHeader = 'Authorization';

    private static ContentTypeHeader = 'Content-Type';

    static async get<T = any>(url: string): Promise<T> {
        const headers = this.appendAuthorizationHeader();
        const options = {
            method: 'GET',
            headers
        };
        const response = await fetch(url, options);
        return response.json();
    }

    static async post<T = any>(url: string, body: string | object): Promise<T> {
        const headers = {
            [this.ContentTypeHeader]: this.inferContentType(body)
        };
        this.appendAuthorizationHeader(headers);
        if (typeof body === 'object') {
            body = JSON.stringify(body);
        }
        const options = {
            method: 'POST',
            body,
            headers
        };
        const response = await fetch(url, options);
        return response.json();
    }

    static async put<T = any>(url: string, body: string | object): Promise<T> {
        const headers = {
            [this.ContentTypeHeader]: this.inferContentType(body)
        };
        this.appendAuthorizationHeader(headers);
        if (typeof body === 'object') {
            body = JSON.stringify(body);
        }
        const options = {
            method: 'PUT',
            body,
            headers
        };
        const response = await fetch(url, options);
        return response.json();
    }

    static async delete<T = any>(url: string): Promise<T> {
        const headers = this.appendAuthorizationHeader();
        const options = {
            method: 'PUT',
            headers
        };
        const response = await fetch(url, options);
        return response.json();
    }
    
    private static inferContentType(body: string | object): string {
        if (typeof body === 'object') {
            return 'application/json';
        }
        return 'text/plain';
    }

    private static appendAuthorizationHeader(headers: Record<string, string> = {}): Record<string, string> {
        const token = JwtUtils.readTokenFromStorage();
        if (token !== null) {
            headers[this.AuthorizationHeader] = token;
        }
        return headers;
    }

}
