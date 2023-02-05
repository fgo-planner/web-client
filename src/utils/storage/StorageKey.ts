import { TypeOfTag } from 'typescript';

export type StorageType = 'local' | 'session';

export type StorageValueType = string | number | boolean | object;

export type StorageValueTypeTag = TypeOfTag & ('string' | 'number' | 'boolean' | 'object');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class StorageKey<T extends StorageValueType = any> {

    /**
     * Whether the key-value is stored in the local or session storage.
     */
    readonly storageType: StorageType;

    /**
     * The type of value stored.
     */
    readonly valueType: StorageValueTypeTag;

    private constructor(readonly key: string, storageType: StorageType, valueType: StorageValueTypeTag) {
        this.storageType = storageType;
        this.valueType = valueType;
    }

    /**
     * Instantiates a `StorageKey` for storing a `string` type value.
     */
    static forStringValue(key: string, storageType: StorageType): StorageKey<string> {
        return new StorageKey<string>(key, storageType, 'string');
    }

    /**
     * Instantiates a `StorageKey` for storing a `number` type value.
     */
    static forNumberValue(key: string, storageType: StorageType): StorageKey<number> {
        return new StorageKey<number>(key, storageType, 'number');
    }

    /**
     * Instantiates a `StorageKey` for storing a `boolean` type value.
     */
    static forBooleanValue(key: string, storageType: StorageType): StorageKey<boolean> {
        return new StorageKey<boolean>(key, storageType, 'boolean');
    }

    /**
     * Instantiates a `StorageKey` for storing an object value.
     */
    static forObjectValue(key: string, storageType: StorageType): StorageKey<object> {
        return new StorageKey<object>(key, storageType, 'object');
    }

}
