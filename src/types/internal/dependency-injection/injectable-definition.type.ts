import { AbstractType, Type } from '..';

export type InjectableDefinition<T = any> =
    /**
     * Concrete class injectables can be declared using the class itself if no
     * qualifier or explicit value is needed.
     */
    Type<T> |
    /**
     * Concrete class injectables can also be declared with optional qualifier
     * and/or explicit value.
     */
    {
        token: Type<T>,
        qualifier?: string,
        value?: T
    } |
    /**
     * Abstract class injectables must be declared with an explicit value. Qualifier
     * is still optional.
     */
    {
        token: AbstractType<T>,
        qualifier?: string,
        value: T
    } |
    /**
     * Other injectables must be declared with a qualifier and explicit value.
     */
    {
        token?: undefined,
        qualifier: string,
        value: T
    };
