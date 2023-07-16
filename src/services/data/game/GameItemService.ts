import { Nullable } from '@fgo-planner/common-core';
import { GameItem, GameItemBackground, GameItemConstants } from '@fgo-planner/data-core';
import { Injectable } from '../../../decorators/dependency-injection/Injectable.decorator';
import { GameItemCategory, GameItemCategoryMap, GameItemList, Page, Pagination } from '../../../types';
import { LockableUIFeature } from '../../../types/dto/LockableUIFeature.enum';
import { GameItemMap } from '../../../utils/game/GameItemMap';
import { HttpUtils as Http } from '../../../utils/HttpUtils';
import { DataService } from '../DataService';

@Injectable
export class GameItemService extends DataService {

    private _itemList?: GameItemList;

    private _itemMap?: GameItemMap;

    private _itemCategoryMap?: GameItemCategoryMap;

    private _itemListPromise?: Promise<GameItemList>;

    constructor() {
        super(`${process.env.REACT_APP_REST_ENDPOINT}/game-item`);
    }

    async getItem(id: number): Promise<Nullable<GameItem>> {
        return Http.get<Nullable<GameItem>>(`${this._BaseUrl}/${id}`);
    }

    /**
     * Asynchronously returns the cached items list. If the data is not available,
     * returns a promise that resolves once the data is fetched and cached.
     */
    async getItems(): Promise<GameItemList> {
        if (this._itemList) {
            return this._itemList;
        }
        if (!this._itemListPromise) {
            const lockId = this._userInterfaceService.requestLock(LockableUIFeature.LoadingIndicator);
            this._itemListPromise = Http.get<Array<GameItem>>(`${this._BaseUrl}`);
            this._itemListPromise.then(data => {
                this._onItemsLoaded(data);
            }).catch(error => {
                this._onItemsLoadError(error);
            }).finally(() => {
                this._userInterfaceService.releaseLock(LockableUIFeature.LoadingIndicator, lockId);
            });
        }
        return this._itemListPromise;
    }

    /**
     * Synchronously returns the cached items list. If the data is not available,
     * then returns `undefined`.
     */
    getItemsSync(): GameItemList | undefined {
        return this._itemList;
    }

    /**
     * Asynchronously returns the cached items map data. If the data is not
     * available, returns a promise that resolves once the data is fetched and
     * cached.
     */
    async getItemsMap(): Promise<GameItemMap> {
        if (!this._itemMap) {
            await this.getItems();
        }
        return this._itemMap!!;
    }

    /**
     * Asynchronously returns the cached item ID category map. The items in each
     * category are sorted by its `priority` value.
     */
    async getItemCategoryMap(): Promise<GameItemCategoryMap> {
        if (!this._itemCategoryMap) {
            await this.getItems();
        }
        return this._itemCategoryMap!!;
    }

    /**
     * Synchronously returns the cached items map data. If the data is not
     * available, then returns `undefined`.
     */
    getItemsMapSync(): GameItemMap | undefined {
        return this._itemMap;
    }

    /**
     * Synchronously returns the cached item ID category map. f the data is not
     * available, then returns `undefined`.
     */
    getItemCategoryMapSync(): GameItemCategoryMap | undefined {
        return this._itemCategoryMap;
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

    private _onItemsLoaded(data: GameItemList): void {
        this._itemList = data;
        this._itemMap = new GameItemMap(data);
        this._itemCategoryMap = this._generateAndCategoryMap(data);
        this._itemListPromise = undefined;
    }

    private _onItemsLoadError(_error: any): void {
        this._invalidateCaches();
    }

    /**
     * @deprecated Not needed
     */
    private _invalidateCaches(): void {
        this._itemList = undefined;
        this._itemMap = undefined;
    }

    private _generateAndCategoryMap(items: GameItemList): Record<GameItemCategory, Set<number>> {
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
        return categoryMap;
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
