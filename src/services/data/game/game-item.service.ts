import { GameItem } from 'data';
import { Nullable, Page, Pagination, ReadonlyRecord } from 'internal';
import { Service } from 'typedi';
import { HttpUtils as Http } from 'utils';

type ItemsCache = ReadonlyArray<Readonly<GameItem>>;

type ItemsCacheMap = ReadonlyRecord<number, Readonly<GameItem>>;

@Service()
export class GameItemService {

    private readonly BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-item`;

    private _itemsCache: Nullable<ItemsCache>;

    private _itemsCacheMap: Nullable<ItemsCacheMap>;

    private _itemCachePromise: Nullable<Promise<ItemsCache>>;

    async getItem(id: number): Promise<GameItem> {
        return Http.get<GameItem>(`${this.BaseUrl}/${id}`);
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
        if (!this._itemCachePromise) {
            this._itemCachePromise = Http.get<GameItem[]>(`${this.BaseUrl}`);
            this._itemCachePromise
                .then(this._onItemCacheLoaded.bind(this))
                .catch(this._onItemCacheLoadError.bind(this));
        }
        return this._itemCachePromise;
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

    private _onItemCacheLoaded(data: ReadonlyArray<GameItem>) {
        this._generateCacheMap(this._itemsCache = data);
        this._itemCachePromise = null;
    }

    private _onItemCacheLoadError(error: any) {
        this._invalidateCache();
    }

    private _invalidateCache() {
        this._itemsCache = null;
        this._itemsCacheMap = null;
    }

    private _generateCacheMap(items: ReadonlyArray<GameItem>) {
        const cacheMap: Record<number, Readonly<GameItem>> = {};
        for (const item of items) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            cacheMap[item._id!!] = item;
        }
        this._itemsCacheMap = cacheMap;
    }

}
