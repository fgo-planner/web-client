import { Immutable, Nullable } from '@fgo-planner/common-core';
import { GameItem, GameItemBackground, GameItemConstants } from '@fgo-planner/data-core';
import { Inject } from '../../../decorators/dependency-injection/Inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/Injectable.decorator';
import { GameItemCategory, GameItemCategoryMap, GameItemList, GameItemMap, Page, Pagination } from '../../../types';
import { LockableUIFeature } from '../../../types/dto/LockableUIFeature.enum';
import { HttpUtils as Http } from '../../../utils/HttpUtils';
import { UserInterfaceService } from '../../user-interface/UserInterfaceService';

@Injectable
export class GameItemService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/game-item`;

    @Inject(UserInterfaceService)
    private readonly _userInterfaceService!: UserInterfaceService;

    private _cachedItems?: GameItemList;

    private _cachedItemsMap?: GameItemMap;

    private _cachedItemsCategoryMap?: GameItemCategoryMap;

    private _cachedItemsPromise?: Promise<GameItemList>;

    async getItem(id: number): Promise<Nullable<GameItem>> {
        return Http.get<Nullable<GameItem>>(`${this._BaseUrl}/${id}`);
    }

    /**
     * Asynchronously returns the cached items list. If the data is not available,
     * returns a promise that resolves once the data is fetched and cached.
     */
    async getItems(): Promise<GameItemList> {
        if (this._cachedItems) {
            return this._cachedItems;
        }
        if (!this._cachedItemsPromise) {
            const lockId = this._userInterfaceService.requestLock(LockableUIFeature.LoadingIndicator);
            this._cachedItemsPromise = Http.get<Array<GameItem>>(`${this._BaseUrl}`);
            this._cachedItemsPromise.then(cache => {
                this._onItemsCacheLoaded(cache);
            }).catch(error => {
                this._onItemsCacheLoadError(error);
            }).finally(() => {
                this._userInterfaceService.releaseLock(LockableUIFeature.LoadingIndicator, lockId);
            });
        }
        return this._cachedItemsPromise;
    }

    /**
     * Synchronously returns the cached items list. If the data is not available,
     * then returns `undefined`.
     */
    getItemsSync(): GameItemList | undefined {
        return this._cachedItems;
    }

    /**
     * Asynchronously returns the cached items map data. If the data is not
     * available, returns a promise that resolves once the data is fetched and
     * cached.
     */
    async getItemsMap(): Promise<GameItemMap> {
        if (!this._cachedItemsMap) {
            await this.getItems();
        }
        return this._cachedItemsMap!!;
    }

    /**
     * Asynchronously returns the cached item ID category map. The items in each
     * category are sorted by its `priority` value.
     */
    async getItemCategoryMap(): Promise<GameItemCategoryMap> {
        if (!this._cachedItemsCategoryMap) {
            await this.getItems();
        }
        return this._cachedItemsCategoryMap!!;
    }

    /**
     * Synchronously returns the cached items map data. If the data is not
     * available, then returns `undefined`.
     */
    getItemsMapSync(): GameItemMap | undefined {
        return this._cachedItemsMap;
    }

    /**
     * Synchronously returns the cached item ID category map. f the data is not
     * available, then returns `undefined`.
     */
    getItemCategoryMapSync(): GameItemCategoryMap | undefined {
        return this._cachedItemsCategoryMap;
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
        this._cachedItems = data;
        this._generateAndCacheMap(data);
        this._generateAndCacheCategoryMap(data);
        this._cachedItemsPromise = undefined;
    }

    private _onItemsCacheLoadError(error: any): void {
        this._invalidateCaches();
    }

    /**
     * @deprecated Not needed
     */
    private _invalidateCaches(): void {
        this._cachedItems = undefined;
        this._cachedItemsMap = undefined;
    }

    private _generateAndCacheMap(items: GameItemList): void {
        const map: Record<number, Immutable<GameItem>> = {};
        for (const item of items) {
            map[item._id] = item;
        }
        this._cachedItemsMap = map;
    }

    private _generateAndCacheCategoryMap(items: GameItemList): void {
        const categoryMap: Record<GameItemCategory, Set<number>> = {
            [GameItemCategory.AscensionStatues]: new Set(),
            [GameItemCategory.SkillGems]: new Set(),
            [GameItemCategory.BronzeEnhancementMaterials]: new Set(),
            [GameItemCategory.SilverEnhancementMaterials]: new Set(),
            [GameItemCategory.GoldEnhancementMaterials]: new Set()
        };
        /**
         * The items array sorted by `priority`.
         */
        const itemsSorted = [...items].sort((a, b) => a.priority - b.priority);
        for (const item of itemsSorted) {
            const { _id: itemId, background } = item;
            const category = this._getItemCategory(itemId, background);
            if (category != null) {
                categoryMap[category].add(itemId);
            }
        }
        this._cachedItemsCategoryMap = categoryMap;
    }

    private _getItemCategory(itemId: number, background: GameItemBackground): GameItemCategory | null {
        if (itemId >= GameItemConstants.AscensionStatueItemIdMin && itemId < GameItemConstants.AscensionStatueItemIdMax) {
            return GameItemCategory.AscensionStatues;
        }
        if (itemId >= GameItemConstants.SkillGemItemIdMin && itemId < GameItemConstants.SkillGemItemIdMax) {
            return GameItemCategory.SkillGems;
        }
        if (itemId >= GameItemConstants.EnhancementMaterialItemIdMin && itemId < GameItemConstants.EnhancementMaterialItemIdMax) {
            if (background === GameItemBackground.Bronze) {
                return GameItemCategory.BronzeEnhancementMaterials;
            }
            if (background === GameItemBackground.Silver) {
                return GameItemCategory.SilverEnhancementMaterials;
            }
            if (background === GameItemBackground.Gold) {
                return GameItemCategory.GoldEnhancementMaterials;
            }
        }
        return null;
    }

}
