import 'reflect-metadata';
import { InjectableToken, InjectedField } from '../../types';

export const InjectableMetadataKey = Symbol('InjectedFields');

export function Inject(token: InjectableToken, qualifier?: string): (target: any, field: string) => void;
export function Inject(qualifier: string): (target: any, field: string) => void;
export function Inject(param1: InjectableToken | string, param2?: string): (target: any, field: string) => void {
    return function (target: any, field: string) {
        let injectedFields = Reflect.getMetadata(InjectableMetadataKey, target) as Array<InjectedField>;
        if (!injectedFields) {
            injectedFields = [];
        }
        injectedFields.push({ field, param1, param2 });
        Reflect.metadata(InjectableMetadataKey, injectedFields)(target);
    };
}
