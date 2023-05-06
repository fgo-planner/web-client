import { Immutable, ImmutableArray } from '@fgo-planner/common-core';
import { Entity } from '@fgo-planner/data-core';

export abstract class GameEntityMap<T extends Entity<number>> {

    /**
     * Using a Map instead of an object to store the records because the records
     * expected to have a fixed and finite number of entries, the integer keys can
     * have large values, in which case a Map will perform better.
     *
     * @see https://www.zhenghao.io/posts/object-vs-map
     * @see https://codesandbox.io/s/still-glitter-yuu1dm
     */
    private readonly _records: ReadonlyMap<number, Immutable<T>>;

    private readonly _loggedMissingIds = new Set<number>();

    constructor(data: ImmutableArray<T>) {
        const records = new Map<number, Immutable<T>>();
        for (const record of data) {
            const key = record._id as number;
            records.set(key, record);
        }
        this._records = records;
    }

    get(id: number): Immutable<T> | undefined;
    get(id: number, throwErrorIfNotFound: true): Immutable<T>;
    get(id: number, throwErrorIfNotFound?: boolean): Immutable<T> | undefined {
        const record = this._records.get(id);
        if (!record) {
            this._handleMissingEntry(id, throwErrorIfNotFound);
            return undefined;
        }
        return record;
    }

    private _handleMissingEntry(id: number, throwErrorIfNotFound?: boolean): void {
        const errorMessage = `Could not find ${this._getEntityName()} id=${id}`;
        if (throwErrorIfNotFound) {
            throw new Error(errorMessage);
        }
        /**
         * To avoid noisy logs, we only log each missing number once.
         */
        if (!this._loggedMissingIds.has(id)) {
            console.warn(errorMessage);
            this._loggedMissingIds.add(id);
        }
    }

    protected abstract _getEntityName(): string;

}
