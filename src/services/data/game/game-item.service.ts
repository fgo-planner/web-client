import { GameItem } from 'data';
import { Nullable, Page, Pagination, ReadonlyRecord } from 'internal';
import { Container as Injectables, Service } from 'typedi';
import { HttpUtils as Http } from 'utils';
import { LoadingIndicatorOverlayService } from '../../user-interface/loading-indicator-overlay.service';

type ItemsCache = ReadonlyArray<Readonly<GameItem>>;

type ItemsCacheMap = ReadonlyRecord<number, Readonly<GameItem>>;

@Service()
export class GameItemService {

    private readonly BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-item`;

    private _loadingIndicatorService = Injectables.get(LoadingIndicatorOverlayService);

    private _itemsCache: Nullable<ItemsCache>;

    private _itemsCacheMap: Nullable<ItemsCacheMap>;

    private _itemsCachePromise: Nullable<Promise<ItemsCache>>;

    async getItem(id: number): Promise<Nullable<GameItem>> {
        return Http.get<Nullable<GameItem>>(`${this.BaseUrl}/${id}`);
    }

    async getItems(): Promise<ItemsCache> {
        if (this._itemsCache) {
            /*
             * Currently, the same instance of the cache array is returned every time this
             * method is called. This may need to be changed to pass a deep copy of the
             * array.
             */
            return this._itemsCache;
        }
        if (!this._itemsCachePromise) {
            const loadingIndicatorId = this._loadingIndicatorService.invoke();
            this._itemsCachePromise = Http.get<GameItem[]>(`${this.BaseUrl}`);
            this._itemsCachePromise.then(cache => {
                this._onItemsCacheLoaded(cache);
                this._loadingIndicatorService.waive(loadingIndicatorId);
            }).catch(error => {
                this._onItemsCacheLoadError(error);
                this._loadingIndicatorService.waive(loadingIndicatorId);
            });
        }
        return this._itemsCachePromise;
    }

    async getItemsMap(): Promise<ItemsCacheMap> {
        if (!this._itemsCacheMap) {
            await this.getItems();
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._itemsCacheMap!!;
    }

    async getItemsPage(pagination: Pagination): Promise<Page<GameItem>> {
        const params = {
            page: pagination.page,
            limit: pagination.size,
            sort: pagination.sort,
            direction: pagination.direction
        };
        return Http.get<Page<GameItem>>(`${this.BaseUrl}/page`, { params });
    }

    private _onItemsCacheLoaded(data: ReadonlyArray<GameItem>): void {
        this._generateCacheMap(this._itemsCache = data);
        this._itemsCachePromise = null;
    }

    private _onItemsCacheLoadError(error: any): void {
        this._invalidateCache();
    }

    private _invalidateCache(): void {
        this._itemsCache = null;
        this._itemsCacheMap = null;
    }

    private _generateCacheMap(items: ReadonlyArray<GameItem>): void {
        const cacheMap: Record<number, Readonly<GameItem>> = {};
        for (const item of items) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            cacheMap[item._id!!] = item;
        }
        this._itemsCacheMap = cacheMap;
    }

}
