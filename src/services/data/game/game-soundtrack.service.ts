import { CacheArray, GameSoundtrack, Nullable, Page, Pagination } from '../../../types';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { LoadingIndicatorOverlayService } from '../../user-interface/loading-indicator-overlay.service';

type SoundtracksCache = CacheArray<GameSoundtrack>;

export type GameSoundtrackList = SoundtracksCache;

export class GameSoundtrackService {

    private static readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-soundtrack`;

    private static _soundtracksCache: Nullable<SoundtracksCache>;

    private static _soundtracksCachePromise: Nullable<Promise<SoundtracksCache>>;

    static async getSoundtrack(id: number): Promise<Nullable<GameSoundtrack>> {
        return Http.get<Nullable<GameSoundtrack>>(`${this._BaseUrl}/${id}`);
    }

    static async getSoundtracks(): Promise<SoundtracksCache> {
        if (this._soundtracksCache) {
            /*
             * Currently, the same instance of the cache array is returned every time this
             * method is called. This may need to be changed to pass a deep copy of the
             * array.
             */
            return this._soundtracksCache;
        }
        if (!this._soundtracksCachePromise) {
            const loadingIndicatorId = LoadingIndicatorOverlayService.invoke();
            this._soundtracksCachePromise = Http.get<GameSoundtrack[]>(`${this._BaseUrl}`);
            this._soundtracksCachePromise.then(cache => {
                this._onSoundtracksCacheLoaded(cache);
                LoadingIndicatorOverlayService.waive(loadingIndicatorId);
            }).catch(error => {
                this._onSoundtracksCacheLoadError(error);
                LoadingIndicatorOverlayService.waive(loadingIndicatorId);
            });
        }
        return this._soundtracksCachePromise;
    }

    static async getSoundtracksPage(pagination: Pagination): Promise<Page<GameSoundtrack>> {
        const params = {
            page: pagination.page,
            limit: pagination.size,
            sort: pagination.sort,
            direction: pagination.direction
        };
        return Http.get<Page<GameSoundtrack>>(`${this._BaseUrl}/page`, { params });
    }

    private static _onSoundtracksCacheLoaded(data: ReadonlyArray<GameSoundtrack>): void {
        this._soundtracksCachePromise = null;
    }

    private static _onSoundtracksCacheLoadError(error: any): void {
        this._invalidateCache();
    }

    private static _invalidateCache(): void {
        this._soundtracksCache = null;
    }

}
