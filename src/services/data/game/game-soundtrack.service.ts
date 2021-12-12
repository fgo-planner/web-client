import { GameSoundtrack } from '@fgo-planner/types';
import { Inject } from '../../../decorators/dependency-injection/inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { Page, Pagination } from '../../../types/data';
import { CacheArray, Nullable } from '../../../types/internal';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { LoadingIndicatorOverlayService } from '../../user-interface/loading-indicator-overlay.service';

type SoundtracksCache = CacheArray<GameSoundtrack>;

export type GameSoundtrackList = SoundtracksCache;

@Injectable
export class GameSoundtrackService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-soundtrack`;

    @Inject(LoadingIndicatorOverlayService)
    private readonly _loadingIndicatorOverlayService!: LoadingIndicatorOverlayService;

    private _soundtracksCache: Nullable<SoundtracksCache>;

    private _soundtracksCachePromise: Nullable<Promise<SoundtracksCache>>;

    async getSoundtrack(id: number): Promise<Nullable<GameSoundtrack>> {
        return Http.get<Nullable<GameSoundtrack>>(`${this._BaseUrl}/${id}`);
    }

    async getSoundtracks(): Promise<SoundtracksCache> {
        if (this._soundtracksCache) {
            /*
             * Currently, the same instance of the cache array is returned every time this
             * method is called. This may need to be changed to pass a deep copy of the
             * array.
             */
            return this._soundtracksCache;
        }
        if (!this._soundtracksCachePromise) {
            const loadingIndicatorId = this._loadingIndicatorOverlayService.invoke();
            this._soundtracksCachePromise = Http.get<GameSoundtrack[]>(`${this._BaseUrl}`);
            this._soundtracksCachePromise.then(cache => {
                this._onSoundtracksCacheLoaded(cache);
                this._loadingIndicatorOverlayService.waive(loadingIndicatorId);
            }).catch(error => {
                this._onSoundtracksCacheLoadError(error);
                this._loadingIndicatorOverlayService.waive(loadingIndicatorId);
            });
        }
        return this._soundtracksCachePromise;
    }

    async getSoundtracksPage(pagination: Pagination): Promise<Page<GameSoundtrack>> {
        const params = {
            page: pagination.page,
            limit: pagination.size,
            sort: pagination.sort,
            direction: pagination.direction
        };
        return Http.get<Page<GameSoundtrack>>(`${this._BaseUrl}/page`, { params });
    }

    private _onSoundtracksCacheLoaded(data: ReadonlyArray<GameSoundtrack>): void {
        this._soundtracksCache = data;
        this._soundtracksCachePromise = null;
    }

    private _onSoundtracksCacheLoadError(error: any): void {
        this._invalidateCache();
    }

    private _invalidateCache(): void {
        this._soundtracksCache = null;
    }

}
