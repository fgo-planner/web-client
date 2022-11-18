import { AbstractType, Type } from '@fgo-planner/common-core';

export type InjectableToken<T = any> = Type<T> | AbstractType<T>;
