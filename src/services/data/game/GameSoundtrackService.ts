import { Nullable } from '@fgo-planner/common-core';
import { GameSoundtrack } from '@fgo-planner/data-core';
import { Inject } from '../../../decorators/dependency-injection/Inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/Injectable.decorator';
import { GameSoundtrackList, Page, Pagination } from '../../../types';
import { LockableUIFeature } from '../../../types/dto/LockableUIFeature.enum';
import { HttpUtils as Http } from '../../../utils/HttpUtils';
import {  UserInterfaceService } from '../../user-interface/UserInterfaceService';

@Injectable
export class GameSoundtrackService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-soundtrack`;

    @Inject(UserInterfaceService)
    private readonly _userInterfaceService!: UserInterfaceService;

    private _soundtracksCache?: GameSoundtrackList;

    private _soundtracksCachePromise?: Promise<GameSoundtrackList>;

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
            return this._soundtracksCache;
        }
        if (!this._soundtracksCachePromise) {
            const lockId = this._userInterfaceService.requestLock(LockableUIFeature.LoadingIndicator);
            this._soundtracksCachePromise = Http.get<Array<GameSoundtrack>>(`${this._BaseUrl}`);
            this._soundtracksCachePromise.then(cache => {
                this._onSoundtracksCacheLoaded(cache);
            }).catch(error => {
                this._onSoundtracksCacheLoadError(error);
            }).finally(() => {
                this._userInterfaceService.releaseLock(LockableUIFeature.LoadingIndicator, lockId);
            });
        }
        return this._soundtracksCachePromise;
    }

    /**
     * Synchronously returns the cached soundtracks list. If the data is not available,
     * then returns null/undefined.
     */
    getSoundtracksSync(): GameSoundtrackList | undefined {
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
        this._soundtracksCachePromise = undefined;
    }

    private _onSoundtracksCacheLoadError(error: any): void {
        this._invalidateCache();
    }

    /**
     * @deprecated Not needed
     */
    private _invalidateCache(): void {
        this._soundtracksCache = undefined;
    }

}
