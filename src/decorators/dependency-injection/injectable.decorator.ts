import 'reflect-metadata';
import { Type } from '@fgo-planner/common-core';
import { InjectedField } from '../../types/internal';
import { InjectablesContainer } from '../../utils/dependency-injection/injectables-container';
import { InjectableMetadataKey } from './inject.decorator';

export function Injectable<T extends Type>(BaseClass: T) {
    const injectedFields = Reflect.getMetadata(InjectableMetadataKey, BaseClass.prototype) as Array<InjectedField>;
    if (!injectedFields) {
        return BaseClass;
    }

    return class extends BaseClass {
        constructor(...args: any[]) {
            super(args);
            /*
             * Replace all the fields in the base class that are decorated with the
             * `@Inject` decorator with property accessors. Each property accessor provide
             * lazy access to the corresponding injectable from the `InjectablesContainer`.
             */
            for (const injectedField of injectedFields) {
                const { field, ...injectedFieldParams } = injectedField;
                /**
                 * Name of field for caching the injected value within the class instance.
                 */
                const cacheField = `_${field}`;
                Object.defineProperty(this, field, {
                    get() {
                        /*
                         * Retrieve the cached value if possible.
                         */
                        if (this[cacheField]) {
                            return this[cacheField];
                        }
                        return this[cacheField] = InjectablesContainer.getByParams(injectedFieldParams);
                    }
                });
            }
        }
    };

}
