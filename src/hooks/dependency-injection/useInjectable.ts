import { useMemo } from 'react';
import { InjectableToken } from '../../types';
import { InjectablesContainer } from '../../utils/dependency-injection/InjectablesContainer';

export function useInjectable<T = any>(token: InjectableToken<T>, qualifier?: string): T;
export function useInjectable<T = any>(qualifier: string): T;
export function useInjectable<T>(param1: InjectableToken<T> | string, param2?: string): T {
    const injectable = useMemo(() => InjectablesContainer.getByParams<T>({ param1, param2 }), [param1, param2]);
    if (!injectable) {
        const description = getDescriptionString(param1, param2);
        throw new Error(`Could not find injectable ${description}`);
    }
    return injectable;
}

function getDescriptionString<T = any>(param1: InjectableToken<T> | string, param2?: string): string {
    if (typeof param1 === 'string') {
        return `qualifier=${param1}`;
    } else {
        return `token=${param1}` + (param2 ? ` qualifier=${param2}` : '');
    }
}
