import { InjectableDefinition, InjectableToken, InjectedFieldParams, Type } from '../../types/internal';

export class InjectablesContainer {

    private static readonly _DefaultQualifier = 'default';

    private static readonly _Injectables = new Map<InjectableToken | undefined, Record<string, any>>();

    static registerInjectables(...injectablesDefinitions: Array<InjectableDefinition>) {
        for (const injectableDefinition of injectablesDefinitions) {
            if (typeof injectableDefinition === 'function') {
                this._instantiateAndRegister(injectableDefinition);
                continue;
            }
            if (typeof injectableDefinition === 'object') {
                const { token, qualifier, value } = injectableDefinition;
                if (value !== undefined) {
                    this._register(token, value, qualifier);
                    continue;
                }
                if (typeof token === 'function') {
                    this._instantiateAndRegister(token as Type, qualifier);
                    continue;
                }
            }
            console.error('Invalid injectable: ', injectableDefinition);
        }
    }

    private static _instantiateAndRegister(type: Type, qualifier = this._DefaultQualifier): void {
        const map = this._getSubMapByToken(type);
        if (map[qualifier]) {
            console.error(`Injectable is already registered with qualifier '${qualifier}'`, type);
            return;
        }
        map[qualifier] = new type(); // TODO Handle constructor args
    }

    private static _register<T>(token: InjectableToken<T> | undefined, value: T, qualifier = this._DefaultQualifier): void {
        const map = this._getSubMapByToken(token);
        if (map[qualifier]) {
            console.error(`Injectable is already registered with qualifier '${qualifier}'`, token);
            return;
        }
        map[qualifier] = value;
    }

    static get<T>(token: InjectableToken<T>, qualifier?: string): T | undefined;
    static get<T = any>(qualifier: string): T | undefined;
    static get<T>(param1: InjectableToken<T> | string, param2?: string): T | undefined {
        return this.getByParams({ param1, param2 });
    }

    static getByParams<T>({ param1, param2 }: InjectedFieldParams<T>): T | undefined {
        let map;
        let qualifier;
        if (typeof param1 === 'string') {
            map = this._getSubMapByToken(undefined);
            qualifier = param1;
        } else {
            map = this._getSubMapByToken(param1);
            qualifier = param2 || this._DefaultQualifier;
        }
        return map?.[qualifier];
    }

    private static _getSubMapByToken(token: InjectableToken | undefined): Record<string, any> {
        let map = this._Injectables.get(token);
        if (!map) {
            this._Injectables.set(token, map = {});
        }
        return map;
    }

};
