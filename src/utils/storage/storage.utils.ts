import { Nullable, Supplier } from '@fgo-planner/common-types';
import { StorageKey, StorageType, StorageValueType } from './storage-key.class';

export class StorageUtils {

    static getItemAsString(storageKey: StorageKey): string | null;
    static getItemAsString(storageKey: StorageKey, defaultValueSupplier: Supplier<string>): string;
    static getItemAsString(storageKey: StorageKey, defaultValueSupplier?: Supplier<string>): string | null {
        const { key, storageType } = storageKey;
        const storage = this._getStorage(storageType);
        let value = storage.getItem(key);
        if (value === null && defaultValueSupplier) {
            const defaultValue = defaultValueSupplier.apply(this);
            storage.setItem(key, value = defaultValue);
        }
        return value;
    }

    static getItem<T extends StorageValueType>(storageKey: StorageKey<T>): T | null;
    static getItem<T extends StorageValueType>(storageKey: StorageKey<T>, defaultValueSupplier: Supplier<T>): T;
    static getItem<T extends StorageValueType>(storageKey: StorageKey<T>, defaultValueSupplier?: Supplier<T>): T | null {
        const { key, storageType, valueType } = storageKey;
        const storage = this._getStorage(storageType);
        const value = storage.getItem(key);
        if (value === null) {
            if (defaultValueSupplier) {
                return this._setDefaultValue(key, storage, defaultValueSupplier);
            }
            return null;
        }
        if (valueType === 'string') {
            return value as T; // T should be string
        }
        const typedValue = JSON.parse(value);
        /*
         * Check if the type of the retrieved value matches the type defined in the
         * `StorageKey` before returning.
         */
        if (typeof typedValue === valueType) {
            return typedValue;
        }
        /*
         * If the type of the retrieved value doesn't match the type defined in the
         * `StorageKey`, then treat the value as if it was `null` (if a default value
         * function is given, then it will be invoked, and the resulting value will be
         * stored and returned).
         */
        if (defaultValueSupplier) {
            return this._setDefaultValue(key, storage, defaultValueSupplier);
        }
        return null;
    }

    /**
     * Sets the value of the pair identified by key to value, creating a new
     * key/value pair if none existed for key previously. If the value is `null` or
     * `undefined`, then removes the key/value pair with the given key instead.
     */
    static setItem<T extends StorageValueType>(storageKey: StorageKey<T>, value: Nullable<T>): void {
        if (value == null) {
            this.removeItem(storageKey);
            return;
        }
        const { key, storageType } = storageKey;
        const storage = this._getStorage(storageType);
        storage.setItem(key, this._asString(value));
    }

    static removeItem(storageKey: StorageKey): void {
        const { key, storageType } = storageKey;
        const storage = this._getStorage(storageType);
        storage.removeItem(key);
    }

    private static _getStorage(storageType: StorageType): Storage {
        if (storageType === 'local') {
            return localStorage;
        } else {
            return sessionStorage;
        }
    }

    private static _setDefaultValue<T extends StorageValueType>(key: string, storage: Storage, defaultValueSupplier: Supplier<T>): T {
        const defaultValue = defaultValueSupplier.apply(this);
        storage.setItem(key, this._asString(defaultValue));
        return defaultValue;
    }

    private static _asString(value: StorageValueType): string {
        if (typeof value === 'string') {
            return value;
        } else {
            return JSON.stringify(value);
        }
    }

}
