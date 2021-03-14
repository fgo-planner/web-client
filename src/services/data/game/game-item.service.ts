import { CacheArray, CacheMap, GameItem, Nullable, Page, Pagination } from '../../../types';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { LoadingIndicatorOverlayService } from '../../user-interface/loading-indicator-overlay.service';

type ItemsCache = CacheArray<GameItem>;

type ItemsCacheMap = CacheMap<number, GameItem>;

export type GameItemList = ItemsCache;

export type GameItemMap = ItemsCacheMap;

export class GameItemService {

    private static readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-item`;

    private static _itemsCache: Nullable<ItemsCache>;

    private static _itemsCacheMap: Nullable<ItemsCacheMap>;

    private static _itemsCachePromise: Nullable<Promise<ItemsCache>>;

    static async getItem(id: number): Promise<Nullable<GameItem>> {
        return Http.get<Nullable<GameItem>>(`${this._BaseUrl}/${id}`);
    }

    static async getItems(): Promise<ItemsCache> {
        if (this._itemsCache) {
            /*
             * Currently, the same instance of the cache array is returned every time this
             * method is called. This may need to be changed to pass a deep copy of the
             * array.
             */
            return this._itemsCache;
        }
        if (!this._itemsCachePromise) {
            const loadingIndicatorId = LoadingIndicatorOverlayService.invoke();
            this._itemsCachePromise = Http.get<GameItem[]>(`${this._BaseUrl}`);
            this._itemsCachePromise.then(cache => {
                this._onItemsCacheLoaded(cache);
                LoadingIndicatorOverlayService.waive(loadingIndicatorId);
            }).catch(error => {
                this._onItemsCacheLoadError(error);
                LoadingIndicatorOverlayService.waive(loadingIndicatorId);
            });
        }
        return this._itemsCachePromise;
    }

    static async getItemsMap(): Promise<ItemsCacheMap> {
        if (!this._itemsCacheMap) {
            await this.getItems();
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._itemsCacheMap!!;
    }

    static async getItemsPage(pagination: Pagination): Promise<Page<GameItem>> {
        const params = {
            page: pagination.page,
            limit: pagination.size,
            sort: pagination.sort,
            direction: pagination.direction
        };
        return Http.get<Page<GameItem>>(`${this._BaseUrl}/page`, { params });
    }

    private static _onItemsCacheLoaded(data: ReadonlyArray<GameItem>): void {
        this._generateCacheMap(this._itemsCache = data);
        this._itemsCachePromise = null;
    }

    private static _onItemsCacheLoadError(error: any): void {
        this._invalidateCache();
    }

    private static _invalidateCache(): void {
        this._itemsCache = null;
        this._itemsCacheMap = null;
    }

    private static _generateCacheMap(items: ReadonlyArray<GameItem>): void {
        const cacheMap: Record<number, Readonly<GameItem>> = {};
        for (const item of items) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            cacheMap[item._id!!] = item;
        }
        this._itemsCacheMap = cacheMap;
    }

}
