import { GameItem } from '@fgo-planner/types';
import { Inject } from '../../../decorators/dependency-injection/inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { GameItemList, GameItemMap, Page, Pagination } from '../../../types/data';
import { Immutable, Nullable } from '../../../types/internal';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { UserInterfaceService } from '../../user-interface/user-interface.service';

@Injectable
export class GameItemService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-item`;

    @Inject(UserInterfaceService)
    private readonly _userInterfaceService!: UserInterfaceService;

    private _itemsCache: Nullable<GameItemList>;

    private _itemsCacheMap: Nullable<GameItemMap>;

    private _itemsCachePromise: Nullable<Promise<GameItemList>>;

    async getItem(id: number): Promise<Nullable<GameItem>> {
        return Http.get<Nullable<GameItem>>(`${this._BaseUrl}/${id}`);
    }

    /**
     * Asynchronously returns the cached items list. If the data is not available,
     * returns a promise that resolves once the data is fetched and cached.
     */
    async getItems(): Promise<GameItemList> {
        if (this._itemsCache) {
            /*
             * TODO Currently, the same instance of the cache array is returned every time
             * this method is called. This may need to be changed so that a deep copy of the
             * array is returned instead.
             */
            return this._itemsCache;
        }
        if (!this._itemsCachePromise) {
            const loadingIndicatorId = this._userInterfaceService.invokeLoadingIndicator();
            this._itemsCachePromise = Http.get<GameItem[]>(`${this._BaseUrl}`);
            this._itemsCachePromise.then(cache => {
                this._onItemsCacheLoaded(cache);
                this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
            }).catch(error => {
                this._onItemsCacheLoadError(error);
                this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
            });
        }
        return this._itemsCachePromise;
    }

    /**
     * Synchronously returns the cached items list. If the data is not available,
     * then returns null/undefined.
     */
    getItemsSync(): Nullable<GameItemList> {
        /*
         * TODO Currently, the same instance of the cache array is returned every time
         * this method is called. This may need to be changed so that a deep copy of the
         * array is returned instead.
         */
        return this._itemsCache;
    }

    /**
     * Asynchronously returns the cached items map data. If the data is not
     * available, returns a promise that resolves once the data is fetched and
     * cached.
     */
    async getItemsMap(): Promise<GameItemMap> {
        if (!this._itemsCacheMap) {
            await this.getItems();
        }
        return this._itemsCacheMap!!;
    }

    /**
     * Synchronously returns the cached items map data. If the data is not
     * available, then returns null/undefined.
     */
    getItemsMapSync(): Nullable<GameItemMap> {
        return this._itemsCacheMap;
    }

    async getItemsPage(pagination: Pagination): Promise<Page<GameItem>> {
        const params = {
            page: pagination.page,
            limit: pagination.size,
            sort: pagination.sort,
            direction: pagination.direction
        };
        return Http.get<Page<GameItem>>(`${this._BaseUrl}/page`, { params });
    }

    private _onItemsCacheLoaded(data: GameItemList): void {
        this._generateCacheMap(this._itemsCache = data);
        this._itemsCachePromise = null;
    }

    private _onItemsCacheLoadError(error: any): void {
        this._invalidateCache();
    }

    /**
     * @deprecated Not needed
     */
    private _invalidateCache(): void {
        this._itemsCache = null;
        this._itemsCacheMap = null;
    }

    private _generateCacheMap(items: GameItemList): void {
        const cacheMap: Record<number, Immutable<GameItem>> = {};
        for (const item of items) {
            cacheMap[item._id] = item;
        }
        this._itemsCacheMap = cacheMap;
    }

}
