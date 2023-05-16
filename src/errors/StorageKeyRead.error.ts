import { StorageKey } from '../utils/storage/StorageKey';

export class StorageKeyReadError extends Error {
    
    constructor(storageKey: StorageKey, options?: ErrorOptions) {
        super(`Could not read ${storageKey.key} from ${storageKey.storageType} storage`, options);
    }

}