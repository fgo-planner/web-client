import { CollectionUtils, Nullable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { Inject } from '../../../decorators/dependency-injection/Inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/Injectable.decorator';
import { GameServantList, HttpOptions, Page, Pagination } from '../../../types';
import { LockableUIFeature } from '../../../types/dto/LockableUIFeature.enum';
import { GameServantMap } from '../../../utils/game/GameServantMap';
import { GameServantUtils } from '../../../utils/game/GameServantUtils';
import { HttpUtils as Http } from '../../../utils/HttpUtils';
import { UserInterfaceService } from '../../user-interface/UserInterfaceService';

@Injectable
export class GameServantService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-servant`;

    private readonly _ExcludeMetadataOptions = {
        params: {
            metadata: false
        }
    } as const satisfies HttpOptions;

    @Inject(UserInterfaceService)
    private readonly _userInterfaceService!: UserInterfaceService;

    private _servantList?: GameServantList;

    private _servantMap?: GameServantMap;

    private _servantListPromise?: Promise<GameServantList>;

    private _servantKeywordsMap?: Map<number, string>;

    private _servantKeywordsMapPromise?: Promise<Map<number, string>>;

    private _fgoManagerNamesMap?: Map<string, number>;

    private _fgoManagerNamesMapPromise?: Promise<Map<string, number>>;

    async getServant(id: number): Promise<Nullable<GameServant>> {
        return Http.get<Nullable<GameServant>>(`${this._BaseUrl}/${id}`);
    }

    /**
     * Asynchronously returns the cached servants array, sorted by their
     * `collectionNo` values. If the data is not available, returns a promise that
     * resolves once the data is fetched and cached.
     */
    async getServants(): Promise<GameServantList> {
        if (this._servantList) {
            return this._servantList;
        }
        if (this._servantListPromise) {
            return this._servantListPromise;
        }
        const lockId = this._userInterfaceService.requestLock(LockableUIFeature.LoadingIndicator);
        const promise = Http.get<Array<GameServant>>(`${this._BaseUrl}`, this._ExcludeMetadataOptions);
        promise.then(data => {
            this._onServantsLoaded(data);
        }).catch(error => {
            this._onServantsLoadError(error);
        }).finally(() => {
            this._userInterfaceService.releaseLock(LockableUIFeature.LoadingIndicator, lockId);
        });
        return this._servantListPromise = promise;
    }

    /**
     * Synchronously returns the cached servants array, sorted by their
     * `collectionNo` values. If the data is not available, then returns
     * `undefined`.
     */
    getServantsSync(): GameServantList | undefined {
        return this._servantList;
    }

    /**
     * Asynchronously returns the cached servants map data. If the data is not
     * available, returns a promise that resolves once the data is fetched and
     * cached.
     */
    async getServantsMap(): Promise<GameServantMap> {
        if (!this._servantMap) {
            await this.getServants();
        }
        return this._servantMap!!;
    }

    /**
     * Synchronously returns the cached servants map data. If the data is not
     * available, then returns `undefined`.
     */
    getServantsMapSync(): GameServantMap | undefined {
        return this._servantMap;
    }

    async getServantKeywordsMap(): Promise<ReadonlyMap<number, string>> {
        if (this._servantKeywordsMap) {
            return this._servantKeywordsMap;
        }
        if (this._servantKeywordsMapPromise) {
            return this._servantKeywordsMapPromise;
        }
        const lockId = this._userInterfaceService.requestLock(LockableUIFeature.LoadingIndicator);
        const url = `${this._BaseUrl}/metadata/search-keywords`;
        const httpPromise = Http.get<Record<number, string>>(url);
        this._servantKeywordsMapPromise = httpPromise.then(data => {
            this._servantKeywordsMapPromise = undefined;
            return this._servantKeywordsMap = CollectionUtils.objectToMap(data, Number);
        }).finally(() => {
            this._userInterfaceService.releaseLock(LockableUIFeature.LoadingIndicator, lockId);
        });
        return this._servantKeywordsMapPromise;
    }

    getServantKeywordsMapSync(): ReadonlyMap<number, string> | undefined {
        return this._servantKeywordsMap;
    }

    async getFgoManagerNamesMap(): Promise<ReadonlyMap<string, number>> {
        if (this._fgoManagerNamesMap) {
            return this._fgoManagerNamesMap;
        }
        if (this._fgoManagerNamesMapPromise) {
            return this._fgoManagerNamesMapPromise;
        }
        const lockId = this._userInterfaceService.requestLock(LockableUIFeature.LoadingIndicator);
        const url = `${this._BaseUrl}/metadata/fgo-manager-names`;
        const httpPromise = Http.get<Record<string, number>>(url);
        this._fgoManagerNamesMapPromise = httpPromise.then(data => {
            this._fgoManagerNamesMapPromise = undefined;
            return this._fgoManagerNamesMap = CollectionUtils.objectToMap(data);
        }).finally(() => {
            this._userInterfaceService.releaseLock(LockableUIFeature.LoadingIndicator, lockId);
        });
        return this._fgoManagerNamesMapPromise;
    }

    /**
     * @deprecated Not used
     */
    async getServantsPage(pagination: Pagination): Promise<Page<GameServant>> {
        const params = {
            page: pagination.page,
            limit: pagination.size,
            sort: pagination.sort,
            direction: pagination.direction
        };
        return Http.get<Page<GameServant>>(`${this._BaseUrl}/page`, { params });
    }

    private _onServantsLoaded(data: Array<GameServant>): void {
        data.sort(GameServantUtils.collectionNoSortFunction);
        this._servantMap = new GameServantMap(this._servantList = data);
        this._servantListPromise = undefined;
    }

    private _onServantsLoadError(_: any): void {
        this._invalidateCache();
    }

    /**
     * @deprecated Not needed
     */
    private _invalidateCache(): void {
        this._servantList = undefined;
        this._servantMap = undefined;
    }

}
