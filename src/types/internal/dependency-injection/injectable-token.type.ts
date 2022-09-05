import { AbstractType, Type } from '@fgo-planner/common-types';

export type InjectableToken<T = any> = Type<T> | AbstractType<T>;
