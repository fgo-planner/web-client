import { StorageKey } from '../utils/storage/StorageKey';

export class StorageKeyValidationError extends Error {
    
    constructor(storageKey: StorageKey, options?: ErrorOptions) {
        super(`Validation failed for ${storageKey.key} in ${storageKey.storageType} storage`, options);
    }

}
