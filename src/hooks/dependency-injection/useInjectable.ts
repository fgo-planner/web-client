import { useMemo } from 'react';
import { InjectableToken } from '../../types';
import { InjectablesContainer } from '../../utils/dependency-injection/InjectablesContainer';

export function useInjectable<T = any>(token: InjectableToken<T>, qualifier?: string): T;
export function useInjectable<T = any>(qualifier: string): T;
export function useInjectable<T>(param1: InjectableToken<T> | string, param2?: string): T {
    const injectable = useMemo(() => InjectablesContainer.getByParams<T>({ param1, param2 }), [param1, param2]);
    if (!injectable) {
        throw new Error(/* TODO Add error message */);
    }
    return injectable;
};
