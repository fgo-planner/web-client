import { AbstractType, Type } from '..';

export type InjectableToken<T = any> = Type<T> | AbstractType<T>;
