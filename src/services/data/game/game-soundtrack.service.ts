import { Nullable } from '@fgo-planner/common-core';
import { GameSoundtrack } from '@fgo-planner/data-core';
import { Inject } from '../../../decorators/dependency-injection/inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { GameSoundtrackList, Page, Pagination } from '../../../types/data';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { LockableFeature, UserInterfaceService } from '../../user-interface/user-interface.service';

@Injectable
export class GameSoundtrackService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-soundtrack`;

    @Inject(UserInterfaceService)
    private readonly _userInterfaceService!: UserInterfaceService;

    private _soundtracksCache: Nullable<GameSoundtrackList>;

    private _soundtracksCachePromise: Nullable<Promise<GameSoundtrackList>>;

    async getSoundtrack(id: number): Promise<Nullable<GameSoundtrack>> {
        return Http.get<Nullable<GameSoundtrack>>(`${this._BaseUrl}/${id}`);
    }

    /**
     * Asynchronously returns the cached soundtrack list. If the data is not
     * available, returns a promise that resolves once the data is fetched and
     * cached.
     */
    async getSoundtracks(): Promise<GameSoundtrackList> {
        if (this._soundtracksCache) {
            /*
             * TODO Currently, the same instance of the cache array is returned every time
             * this method is called. This may need to be changed so that a deep copy of the
             * array is returned instead.
             */
            return this._soundtracksCache;
        }
        if (!this._soundtracksCachePromise) {
            const lockId = this._userInterfaceService.requestLock(LockableFeature.LoadingIndicator);
            this._soundtracksCachePromise = Http.get<Array<GameSoundtrack>>(`${this._BaseUrl}`);
            this._soundtracksCachePromise.then(cache => {
                this._onSoundtracksCacheLoaded(cache);
            }).catch(error => {
                this._onSoundtracksCacheLoadError(error);
            }).finally(() => {
                this._userInterfaceService.releaseLock(LockableFeature.LoadingIndicator, lockId);
            });
        }
        return this._soundtracksCachePromise;
    }

    /**
     * Synchronously returns the cached soundtracks list. If the data is not available,
     * then returns null/undefined.
     */
    getSoundtracksSync(): Nullable<GameSoundtrackList> {
        /*
         * TODO Currently, the same instance of the cache array is returned every time
         * this method is called. This may need to be changed so that a deep copy of the
         * array is returned instead.
         */
        return this._soundtracksCache;
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

    private _onSoundtracksCacheLoaded(data: GameSoundtrackList): void {
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
