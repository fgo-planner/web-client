import { Immutable, Nullable, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import { Inject } from '../../../decorators/dependency-injection/inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { GameServantList, GameServantMap, HttpOptions, Page, Pagination } from '../../../types';
import { GameServantUtils } from '../../../utils/game/game-servant.utils';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { LockableFeature, UserInterfaceService } from '../../user-interface/user-interface.service';

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

    private _servantsList?: GameServantList;

    private _servantsListMap?: GameServantMap;

    private _servantsListPromise?: Promise<GameServantList>;

    private _servantsKeywordsMap?: Record<number, string>;

    private _servantsKeywordsMapPromise?: Promise<Record<number, string>>;

    private _fgoManagerNamesMap?: Record<string, number>;

    private _fgoManagerNamesMapPromise?: Promise<Record<string, number>>;

    async getServant(id: number): Promise<Nullable<GameServant>> {
        return Http.get<Nullable<GameServant>>(`${this._BaseUrl}/${id}`);
    }

    /**
     * Asynchronously returns the cached servants array, sorted by their
     * `collectionNo` values. If the data is not available, returns a promise that
     * resolves once the data is fetched and cached.
     */
    async getServants(): Promise<GameServantList> {
        if (this._servantsList) {
            return this._servantsList;
        }
        if (this._servantsListPromise) {
            return this._servantsListPromise;
        }
        const lockId = this._userInterfaceService.requestLock(LockableFeature.LoadingIndicator);
        const promise = Http.get<Array<GameServant>>(`${this._BaseUrl}`, this._ExcludeMetadataOptions);
        promise.then(data => {
            this._onServantsLoaded(data);
        }).catch(error => {
            this._onServantsCacheLoadError(error);
        }).finally(() => {
            this._userInterfaceService.releaseLock(LockableFeature.LoadingIndicator, lockId);
        });
        return this._servantsListPromise = promise;
    }

    /**
     * Synchronously returns the cached servants array, sorted by their
     * `collectionNo` values. If the data is not available, then returns
     * `undefined`.
     */
    getServantsSync(): GameServantList | undefined {
        return this._servantsList;
    }

    /**
     * Asynchronously returns the cached servants map data. If the data is not
     * available, returns a promise that resolves once the data is fetched and
     * cached.
     */
    async getServantsMap(): Promise<GameServantMap> {
        if (!this._servantsListMap) {
            await this.getServants();
        }
        return this._servantsListMap!!;
    }

    /**
     * Synchronously returns the cached servants map data. If the data is not
     * available, then returns `undefined`.
     */
    getServantsMapSync(): GameServantMap | undefined {
        return this._servantsListMap;
    }

    async getServantKeywordsMap(): Promise<ReadonlyRecord<number, string>> {
        if (this._servantsKeywordsMap) {
            return this._servantsKeywordsMap;
        }
        if (this._servantsKeywordsMapPromise) {
            return this._servantsKeywordsMapPromise;
        }
        const lockId = this._userInterfaceService.requestLock(LockableFeature.LoadingIndicator);
        const url = `${this._BaseUrl}/metadata/search-keywords`;
        this._servantsKeywordsMapPromise = Http.get<Record<number, string>>(url);
        this._servantsKeywordsMapPromise.then(data => {
            this._servantsKeywordsMap = data;
            this._servantsKeywordsMapPromise = undefined;
        }).finally(() => {
            this._userInterfaceService.releaseLock(LockableFeature.LoadingIndicator, lockId);
        });
        return this._servantsKeywordsMapPromise;
    }

    getServantKeywordsMapSync(): ReadonlyRecord<number, string> | undefined {
        return this._servantsKeywordsMap;
    }

    async getFgoManagerNamesMap(): Promise<ReadonlyRecord<string, number>> {
        if (this._fgoManagerNamesMap) {
            return this._fgoManagerNamesMap;
        }
        if (this._fgoManagerNamesMapPromise) {
            return this._fgoManagerNamesMapPromise;
        }
        const lockId = this._userInterfaceService.requestLock(LockableFeature.LoadingIndicator);
        const url = `${this._BaseUrl}/metadata/fgo-manager-names`;
        this._fgoManagerNamesMapPromise = Http.get<Record<string, number>>(url);
        this._fgoManagerNamesMapPromise.then(data => {
            this._fgoManagerNamesMap = data;
            this._fgoManagerNamesMapPromise = undefined;
        }).finally(() => {
            this._userInterfaceService.releaseLock(LockableFeature.LoadingIndicator, lockId);
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
        this._generateServantsMap(this._servantsList = data);
        this._servantsListPromise = undefined;
    }

    private _onServantsCacheLoadError(_: any): void {
        this._invalidateCache();
    }

    /**
     * @deprecated Not needed
     */
    private _invalidateCache(): void {
        this._servantsList = undefined;
        this._servantsListMap = undefined;
    }

    private _generateServantsMap(servants: GameServantList): void {
        const map: Record<number, Immutable<GameServant>> = {};
        for (const servant of servants) {
            map[servant._id] = servant;
        }
        this._servantsListMap = map;
    }

}
