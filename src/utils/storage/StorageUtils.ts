import { Nullable, Supplier } from '@fgo-planner/common-core';
import { Schema, Validator } from 'jsonschema';
import { StorageKeyReadError } from '../../errors/StorageKeyRead.error';
import { StorageKeyValidationError } from '../../errors/StorageKeyValidation.error';
import { StorageKey, StorageType, StorageValueType } from './StorageKey';

export namespace StorageUtils {

    export function getItemAsString(storageKey: StorageKey): string | null;
    export function getItemAsString(storageKey: StorageKey, defaultValueSupplier: Supplier<string>): string;
    export function getItemAsString(storageKey: StorageKey, defaultValueSupplier?: Supplier<string>): string | null {
        const { key, storageType } = storageKey;
        const storage = _getStorage(storageType);
        let value = storage.getItem(key);
        if (value === null && defaultValueSupplier) {
            const defaultValue = defaultValueSupplier();
            storage.setItem(key, value = defaultValue);
        }
        return value;
    }

    export function getItem<T extends StorageValueType>(storageKey: StorageKey<T>): T | null;
    export function getItem<T extends StorageValueType>(storageKey: StorageKey<T>, defaultValueSupplier: Supplier<T>): T;
    export function getItem<T extends StorageValueType>(storageKey: StorageKey<T>, defaultValueSupplier?: Supplier<T>): T | null {
        const { key, storageType, valueType } = storageKey;
        const storage = _getStorage(storageType);
        const value = storage.getItem(key);
        if (value === null) {
            if (defaultValueSupplier) {
                return _setDefaultValue(key, storage, defaultValueSupplier);
            }
            return null;
        }
        if (valueType === 'string') {
            return value as T; // T should be string
        }
        let typedValue: T;
        try {
            typedValue = JSON.parse(value);
        } catch (e) {
            throw new StorageKeyReadError(storageKey, { cause: e });
        }
        /**
         * Check if the type of the retrieved value matches the type defined in the
         * `StorageKey` before returning.
         */
        if (typeof typedValue === valueType) {
            return typedValue;
        }
        /**
         * If the type of the retrieved value doesn't match the type defined in the
         * `StorageKey`, then treat the value as if it was `null` (if a default value
         * function is given, then it will be invoked, and the resulting value will be
         * stored and returned).
         */
        if (defaultValueSupplier) {
            return _setDefaultValue(key, storage, defaultValueSupplier);
        }
        return null;
    }

    export function getItemWithValidation<T extends object>(storageKey: StorageKey<T>, validator: Validator, schema: Schema): T | null {
        const localStorageData = getItem<T>(storageKey);
        if (localStorageData !== null) {
            const validationResult = validator.validate(localStorageData, schema);
            console.debug(validationResult);
            if (!validationResult.valid) {
                throw new StorageKeyValidationError(storageKey);
            }
        }
        return localStorageData;
    }

    /**
     * Sets the value of the pair identified by key to value, creating a new
     * key/value pair if none existed for key previously. If the value is `null` or
     * `undefined`, then removes the key/value pair with the given key instead.
     */
    export function setItem<T extends StorageValueType>(storageKey: StorageKey<T>, value: Nullable<T>): void {
        if (value == null) {
            removeItem(storageKey);
            return;
        }
        const { key, storageType } = storageKey;
        const storage = _getStorage(storageType);
        storage.setItem(key, _asString(value));
    }

    export function removeItem(storageKey: StorageKey): void {
        const { key, storageType } = storageKey;
        const storage = _getStorage(storageType);
        storage.removeItem(key);
    }

    function _getStorage(storageType: StorageType): Storage {
        if (storageType === 'local') {
            return localStorage;
        } else {
            return sessionStorage;
        }
    }

    function _setDefaultValue<T extends StorageValueType>(key: string, storage: Storage, defaultValueSupplier: Supplier<T>): T {
        const defaultValue = defaultValueSupplier();
        storage.setItem(key, _asString(defaultValue));
        return defaultValue;
    }

    function _asString(value: StorageValueType): string {
        if (typeof value === 'string') {
            return value;
        } else {
            return JSON.stringify(value);
        }
    }

}
