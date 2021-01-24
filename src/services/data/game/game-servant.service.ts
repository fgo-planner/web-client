import { GameServant } from 'data';
import { Nullable, Page, Pagination, ReadonlyRecord } from 'internal';
import { Service } from 'typedi';
import { HttpUtils as Http } from 'utils';

type ServantsCache = ReadonlyArray<Readonly<GameServant>>;

type ServantsCacheMap = ReadonlyRecord<number, Readonly<GameServant>>;

@Service()
export class GameServantService {

    private readonly BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-servant`;

    private _servantsCache: Nullable<ServantsCache>;

    private _servantsCacheMap: Nullable<ServantsCacheMap>;

    private _servantCachePromise: Nullable<Promise<ServantsCache>>;

    async getServant(id: number): Promise<GameServant> {
        return Http.get<GameServant>(`${this.BaseUrl}/${id}`);
    }

    async getServants(): Promise<ServantsCache> {
        if (this._servantsCache) {
            /*
             * Currently, the same instance of the cache array is returned every time this
             * method is called. This may need to be changed to pass a deep copy of the
             * array.
             */
            return this._servantsCache;
        }
        if (!this._servantCachePromise) {
            /*
             * TODO Currently, every servant is retrieved and cached with this call. This
             * may need to modify the caching system for servants so that servants are 
             * retrieved and cached only when needed.
             */
            this._servantCachePromise = Http.get<GameServant[]>(`${this.BaseUrl}`);
            this._servantCachePromise
                .then(this._onServantCacheLoaded.bind(this))
                .catch(this._onServantCacheLoadError.bind(this));
        }
        return this._servantCachePromise;
    }

    async getServantsMap(): Promise<ServantsCacheMap> {
        if (!this._servantsCacheMap) {
            await this.getServants();
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._servantsCacheMap!!;
    }

    async getServantsPage(pagination: Pagination): Promise<Page<GameServant>> {
        const params = {
            page: pagination.page,
            limit: pagination.size,
            sort: pagination.sort,
            direction: pagination.direction
        };
        return Http.get<Page<GameServant>>(`${this.BaseUrl}/page`, { params });
    }

    private _onServantCacheLoaded(data: ReadonlyArray<GameServant>) {
        this._generateCacheMap(this._servantsCache = data);
        this._servantCachePromise = null;
    }

    private _onServantCacheLoadError(error: any) {
        this._invalidateCache();
    }

    private _invalidateCache() {
        this._servantsCache = null;
        this._servantsCacheMap = null;
    }

    private _generateCacheMap(servants: ReadonlyArray<GameServant>) {
        const cacheMap: Record<number, Readonly<GameServant>> = {};
        for (const servant of servants) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            cacheMap[servant._id!!] = servant;
        }
        this._servantsCacheMap = cacheMap;
    }

}
