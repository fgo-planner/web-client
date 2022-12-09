import { CollectionUtils, Nullable, ObjectUtils, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameItemConstants, ImmutableMasterAccount, ImmutableMasterServant, InstantiatedServantBondLevel, InstantiatedServantUtils, MasterAccount, MasterAccountUpdate, MasterServant, MasterServantUpdate, MasterServantUpdateUtils, MasterServantUtils } from '@fgo-planner/data-core';
import { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useGameServantMap } from '../../../hooks/data/use-game-servant-map.hook';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../hooks/user-interface/use-loading-indicator.hook';
import { useBlockNavigation, UseBlockNavigationOptions } from '../../../hooks/utils/use-block-navigation.hook';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { GameServantMap, MasterServantAggregatedData } from '../../../types';
import { DataAggregationUtils } from '../../../utils/data-aggregation.utils';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';
import { DataEditUtils } from './data-edit.utils';


//#region Type definitions

export type MasterAccountDataEditHookOptions = {
    /**
     * Whether to prevent user from navigating away from the current route if there
     * is dirty data.
     *
     * Defaults to `true`.
     */
    blockNavigationOnDirtyData?: boolean;
    includeCostumes?: boolean;
    includeItems?: boolean;
    includeServants?: boolean;
    includeSoundtracks?: boolean;
    /**
     * Whether to not process incoming new master account data if the account is
     * different (ID does not match previous account).
     *
     * This should only be set to `true` if the component is expected to be
     * unmounted when another master account is selected.
     */
    skipProcessOnActiveAccountChange?: boolean;
};

/**
 * This container object is guaranteed to be stable between re-renders. A new
 * instance will only be constructed under the following scenarios:
 * - Changes are reverted or persisted.
 * - A different master account selected.
 *
 * The sub-objects within this container object are readonly; new instances will
 * be created whenever the respective data is changed.
 */
export type MasterAccountEditData = {
    bondLevels: ReadonlyRecord<number, InstantiatedServantBondLevel>;
    costumes: ReadonlySet<number>;
    items: ReadonlyRecord<number, number>;
    lastServantInstanceId: number;
    qp: number;
    servantsData: ReadonlyArray<MasterServantAggregatedData>;
    soundtracks: ReadonlySet<number>;
};

/**
 * For internal use only by the hook. Keeps track of the master account data
 * that have been modified.
 */
type MasterAccountEditDirtyData = {
    bondLevels: boolean;
    costumes: boolean;
    items: Set<number>;
    qp: boolean;
    servants: Set<number>;
    /**
     * This will be `true` if the order of the servants have changed or if any
     * servants have been added or removed.
     */
    servantOrder: boolean;
    soundtracks: boolean;
};

/**
 * Contains unmodified master data, slightly restructured for more efficient
 * comparison against current edit data to determine what has been modified.
 */
type MasterAccountEditReferenceData = {
    bondLevels: ReadonlyRecord<number, InstantiatedServantBondLevel>;
    costumes: ReadonlySet<number>;
    items: ReadonlyRecord<number, number>;
    lastServantInstanceId: number;
    qp: number;
    /**
     * Use a `Map` for this to maintain order of insertion.
     */
    servants: ReadonlyMap<number, ImmutableMasterServant>;
    soundtracks: ReadonlySet<number>;
};

type MasterAccountDataEditHookCommon = {
    masterAccountId: string | undefined;
    awaitingRequest: boolean;
    isDataDirty: boolean;
    revertChanges: () => void;
    persistChanges: () => Promise<void>;
};

type MasterAccountUpdateFunctions = {
    /**
     * Directly sets the unlocked costumes IDs. An alternative way to updating the
     * unlocked costumes is through the `MasterServantUpdate` object.
     */
    updateCostumes: (costumeIds: Iterable<number>) => void;
    /**
     * Updates the quantity of a single inventory item.
     */
    updateItem: (itemId: number, action: SetStateAction<number>) => void;
    /**
     * Updates the quantities of inventory items.
     */
    updateItems: (items: ReadonlyRecord<number, SetStateAction<number>>) => void;
    updateQp: (action: SetStateAction<number>) => void;
    /**
     * Adds a single servant using the given `MasterServantUpdate` object.
     * 
     * Calls the `addServants` function internally. 
     */
    addServant: (gameId: number, servantData: MasterServantUpdate) => void;
    /**
     * Batch adds servants. Each added servant will be instantiated using the given
     * `MasterServantUpdate` object.
     */
    addServants: (gameIds: Iterable<number>, servantData: MasterServantUpdate) => void;
    /**
     * Updates the servants with the corresponding `instanceIds` using the given
     * `MasterServantUpdate` object.
     */
    updateServants: (instanceIds: Iterable<number>, update: MasterServantUpdate) => void;
    /**
     * Updates the servant ordering based on an array of `instanceId` values.
     * Assumes that the array contains a corresponding `instanceId` value for each
     * servant. Missing `instanceId` values will result in the corresponding servant
     * being removed.
     */
    updateServantOrder: (instanceIds: ReadonlyArray<number>) => void;
    /**
     * Deletes the servants with the corresponding `instanceIds`.
     */
    deleteServants: (instanceIds: Iterable<number>) => void;
    updateSoundtracks: (soundtrackIds: Iterable<number>) => void;
};

type MasterAccountDataEditHookResult = MasterAccountDataEditHookCommon & {
    masterAccountEditData: MasterAccountEditData;
} & MasterAccountUpdateFunctions;

type MasterAccountDataEditHookResultCostumesSubset = MasterAccountDataEditHookCommon & {
    masterAccountEditData: Pick<MasterAccountEditData, 'costumes'>;
} & Pick<MasterAccountUpdateFunctions, 'updateCostumes'>;

type MasterAccountDataEditHookResultItemsSubset = MasterAccountDataEditHookCommon & {
    masterAccountEditData: Pick<MasterAccountEditData, 'items' | 'qp'>;
} & Pick<MasterAccountUpdateFunctions, 'updateItem' | 'updateQp'>;

type MasterAccountDataEditHookResultServantsSubset = MasterAccountDataEditHookCommon & {
    masterAccountEditData: Pick<MasterAccountEditData, 'bondLevels' | 'servantsData'>;
} & Pick<MasterAccountUpdateFunctions, 'addServant' | 'addServants' | 'updateServants' | 'updateServantOrder' | 'deleteServants'>;

type MasterAccountDataEditHookResultSoundtracksSubset = MasterAccountDataEditHookCommon & {
    masterAccountEditData: Pick<MasterAccountEditData, 'soundtracks'>;
} & Pick<MasterAccountUpdateFunctions, 'updateSoundtracks'>;

//#endregion


//#region Constants

const BlockNavigationPrompt = 'There are unsaved changes. Are you sure you want to discard all changes and leave the page?';

const BlockNavigationConfirmButtonText = 'Discard';

const BlockNavigationHookOptions: UseBlockNavigationOptions = {
    confirmButtonLabel: BlockNavigationConfirmButtonText,
    prompt: BlockNavigationPrompt
};

//#endregion


//#region Internal helper/utility functions

const getDefaultMasterAccountEditData = (): MasterAccountEditData => ({
    bondLevels: {},
    costumes: CollectionUtils.emptySet(),
    lastServantInstanceId: 0,
    items: {},
    qp: 0,
    servantsData: CollectionUtils.emptyArray(),
    soundtracks: CollectionUtils.emptySet()
});

const cloneMasterAccountDataForEdit = (
    masterAccount: Nullable<ImmutableMasterAccount>,
    gameServantMap: GameServantMap,
    options: MasterAccountDataEditHookOptions
): MasterAccountEditData => {

    const result = getDefaultMasterAccountEditData();

    if (!masterAccount) {
        return result;
    }

    if (options.includeCostumes) {
        result.costumes = new Set(masterAccount.costumes);
    }
    if (options.includeItems) {
        result.items = {
            ...masterAccount.resources.items
        };
        result.qp = masterAccount.resources.qp;
    }
    if (options.includeServants) {
        result.bondLevels = {
            ...masterAccount.bondLevels
        };
        result.servantsData = DataAggregationUtils.aggregateDataForMasterServants(
            masterAccount.servants.map(MasterServantUtils.clone),
            gameServantMap
        );
        result.lastServantInstanceId = masterAccount.lastServantInstanceId;
    }
    if (options.includeSoundtracks) {
        result.soundtracks = new Set(masterAccount.soundtracks);
    }

    return result;
};

const getDefaultMasterAccountReferenceData = (): MasterAccountEditReferenceData => ({
    bondLevels: {},
    costumes: CollectionUtils.emptySet(),
    items: {},
    lastServantInstanceId: 0,
    qp: 0,
    servants: CollectionUtils.emptyMap(),
    soundtracks: CollectionUtils.emptySet()
});

const cloneMasterAccountDataForReference = (
    masterAccount: Nullable<ImmutableMasterAccount>,
    options: MasterAccountDataEditHookOptions
): Readonly<MasterAccountEditReferenceData> => {

    const result = getDefaultMasterAccountReferenceData();

    if (!masterAccount) {
        return result;
    }

    /**
     * No need to deep clone here as long as the source data is properly deep cloned
     * for the edit data.
     */

    if (options.includeCostumes) {
        result.costumes = new Set(masterAccount.costumes);
    }
    if (options.includeItems) {
        result.items = masterAccount.resources.items;
        result.qp = masterAccount.resources.qp;
    }
    if (options.includeServants) {
        result.bondLevels = masterAccount.bondLevels;
        result.servants = CollectionUtils.mapIterableToMap(
            masterAccount.servants,
            InstantiatedServantUtils.getInstanceId
        );
        result.lastServantInstanceId = masterAccount.lastServantInstanceId;
    }
    if (options.includeSoundtracks) {
        result.soundtracks = new Set(masterAccount.soundtracks);
    }

    return result;
};

const getDefaultMasterAccountEditDirtyData = (): MasterAccountEditDirtyData => ({
    bondLevels: false,
    costumes: false,
    items: new Set(),
    qp: false,
    servants: new Set(),
    servantOrder: false,
    soundtracks: false
});

const hasDirtyData = (dirtyData: MasterAccountEditDirtyData): boolean => !!(
    dirtyData.bondLevels ||
    dirtyData.costumes ||
    dirtyData.items.size ||
    dirtyData.qp ||
    dirtyData.servants.size ||
    dirtyData.servantOrder ||
    dirtyData.soundtracks
);

const isMasterServantChanged = (
    reference: ImmutableMasterServant | undefined,
    masterServant: ImmutableMasterServant
): boolean => {
    if (!reference) {
        return true;
    }
    return !MasterServantUtils.isEqual(reference, masterServant);
};

//#endregion


//#region Hook function

/**
 * Utility hook that manages the state of the master account data during
 * editing. Returns the current state of the data and functions that can be
 * called to update the data.
 * 
 * Specific overload for costumes route.
 */
export function useMasterAccountDataEdit(
    options: MasterAccountDataEditHookOptions & {
        includeCostumes: true;
        includeItems?: false;
        includeServants?: false;
        includeSoundtracks?: false;
    }
): MasterAccountDataEditHookResultCostumesSubset;
/**
 * Utility hook that manages the state of the master account data during
 * editing. Returns the current state of the data and functions that can be
 * called to update the data.
 * 
 * Specific overload for items route.
 */
export function useMasterAccountDataEdit(
    options: MasterAccountDataEditHookOptions & {
        includeCostumes?: false;
        includeItems: true;
        includeServants?: false;
        includeSoundtracks?: false;
    }
): MasterAccountDataEditHookResultItemsSubset;
/**
 * Utility hook that manages the state of the master account data during
 * editing. Returns the current state of the data and functions that can be
 * called to update the data.
 * 
 * Specific overload for servants route.
 */
export function useMasterAccountDataEdit(
    options: MasterAccountDataEditHookOptions & {
        includeCostumes: true;
        includeItems?: false;
        includeServants: true;
        includeSoundtracks?: false;
    }
): MasterAccountDataEditHookResultCostumesSubset & MasterAccountDataEditHookResultServantsSubset;
/**
 * Utility hook that manages the state of the master account data during
 * editing. Returns the current state of the data and functions that can be
 * called to update the data.
 * 
 * Specific overload for soundtracks route.
 */
export function useMasterAccountDataEdit(
    options: MasterAccountDataEditHookOptions & {
        includeCostumes?: false;
        includeItems?: false;
        includeServants?: false;
        includeSoundtracks: true;
    }
): MasterAccountDataEditHookResultSoundtracksSubset;
/**
 * Utility hook that manages the state of the master account data during
 * editing. Returns the current state of the data and functions that can be
 * called to update the data.
 */
export function useMasterAccountDataEdit(
    options?: MasterAccountDataEditHookOptions
): MasterAccountDataEditHookResult;

/**
 * Function implementation.
 */
export function useMasterAccountDataEdit(
    options: MasterAccountDataEditHookOptions = {}
): MasterAccountDataEditHookResult {

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const masterAccountService = useInjectable(MasterAccountService);

    const gameServantMap = useGameServantMap();

    const {
        blockNavigationOnDirtyData = true,
        includeCostumes,
        includeItems,
        includeServants,
        includeSoundtracks,
        skipProcessOnActiveAccountChange
    } = options;

    /**
     * The original master account data.
     */
    const [masterAccount, setMasterAccount] = useState<Nullable<ImmutableMasterAccount>>();

    /**
     * The current master account ID.
     */
    const masterAccountId = masterAccount?._id;

    /**
     * The transformed copy of the master account data for editing.
     */
    const [editData, setEditData] = useState<MasterAccountEditData>(getDefaultMasterAccountEditData);

    /**
     * Another transformed copy of the master account data, for use as a reference
     * in determining whether data has been changed. This set of data will not be
     * modified.
     */
    const [referenceData, setReferenceData] = useState<Readonly<MasterAccountEditReferenceData>>(getDefaultMasterAccountReferenceData);

    /**
     * Tracks touched/dirty data.
     */
    const [dirtyData, setDirtyData] = useState<MasterAccountEditDirtyData>(getDefaultMasterAccountEditDirtyData);

    /**
     * Whether the tracked data is dirty.
     */
    const isDataDirty = hasDirtyData(dirtyData);

    /**
     * Whether there is an awaiting request to the back-end.
     */
    const [awaitingRequest, setAwaitingRequest] = useState<boolean>(false);

    /**
     * Prevent user from navigating away if data is dirty.
     */
    useBlockNavigation(blockNavigationOnDirtyData && isDataDirty, BlockNavigationHookOptions);

    /**
     * Reconstruct the include options in a new object using `useMemo` so that it
     * doesn't inadvertently trigger recomputation of hooks even if the options
     * haven't changed.
     */
    const includeOptions = useMemo((): MasterAccountDataEditHookOptions => ({
        includeCostumes,
        includeItems,
        includeServants,
        includeSoundtracks
    }), [includeCostumes, includeItems, includeServants, includeSoundtracks]);

    /**
     * Master account change subscription.
     */
    useEffect(() => {
        if (!gameServantMap) {
            return;
        }

        /**
         * Whether or not to process the next `MasterAccount` data that comes in from
         * the observable.
         */
        const shouldProcessNext = (nextMasterAccount: Nullable<MasterAccount>): boolean => {
            if (!skipProcessOnActiveAccountChange || !masterAccountId) {
                return true;
            }
            return masterAccountId === nextMasterAccount?._id;
        };

        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(masterAccount => {
                if (!shouldProcessNext(masterAccount)) {
                    return;
                }
                const editData = cloneMasterAccountDataForEdit(masterAccount, gameServantMap, includeOptions);
                const referenceData = cloneMasterAccountDataForReference(masterAccount, includeOptions);
                setEditData(editData);
                setReferenceData(referenceData);
                setDirtyData(getDefaultMasterAccountEditDirtyData());
                setMasterAccount(masterAccount);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [gameServantMap, includeOptions, masterAccountId, skipProcessOnActiveAccountChange]);

    /**
     * Master account available changes subscription.
     */
    useEffect(() => {
        const onMasterAccountChangesAvailableSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.MasterAccountChangesAvailable)
            .subscribe(masterAccountChanges => {
                // TODO Implement this
            });

        return () => onMasterAccountChangesAvailableSubscription.unsubscribe();
    }, [includeOptions]);


    //#region Local create, update, delete functions

    const updateCostumes = useCallback((costumeIds: Iterable<number>): void => {
        if (!includeCostumes) {
            return;
        }
        /**
         * Construct a new `Set` here instead of using `DataEditUtils.toSet` to remove
         * the possibility the passed `costumeIds` (if it is a `Set`) from being
         * modified externally.
         */
        editData.costumes = new Set(costumeIds);
        const isDirty = !CollectionUtils.isSetsEqual(editData.costumes, referenceData.costumes);
        setDirtyData(dirtyData => ({
            ...dirtyData,
            costumes: isDirty
        }));
    }, [editData, referenceData.costumes, includeCostumes]);

    const updateQp = useCallback((action: SetStateAction<number>): void => {
        if (!includeItems) {
            return;
        }
        const amount = DataEditUtils.getUpdatedValue(action, editData.qp);
        if (editData.qp === amount) {
            return;
        }
        editData.qp = amount;
        const isDirty = amount !== referenceData.qp;
        setDirtyData(dirtyData => ({
            ...dirtyData,
            qp: isDirty
        }));
    }, [editData, referenceData.qp, includeItems]);

    /**
     * For internal use only by this hook. Returns the updated item quantity as a
     * result of the action. Returns `null` if the value is unchanged, or if the
     * target item is QP.
     */
    const getUpdatedItemQuantity = useCallback((itemId: number, action: SetStateAction<number>): number | null => {
        if (itemId === GameItemConstants.QpItemId) {
            return null;
        }
        const currentQuantity = editData.items[itemId];
        const updatedQuantity = DataEditUtils.getUpdatedValue(action, currentQuantity);
        if (updatedQuantity !== currentQuantity) {
            return updatedQuantity;
        }
        return null;
    }, [editData]);

    /**
     * For internal use only by this hook. Gets the original quantity of the item
     * from the reference data. Returns 0 if the item does not exist in the
     * reference data.
     */
    const getReferenceItemQuantity = useCallback((itemId: number): number => {
        return referenceData.items[itemId] || 0;
    }, [referenceData]);

    const updateItem = useCallback((itemId: number, action: SetStateAction<number>): void => {
        if (!includeItems) {
            return;
        }
        if (itemId === GameItemConstants.QpItemId) {
            updateQp(action);
            return;
        }
        const updatedQuantity = getUpdatedItemQuantity(itemId, action);
        if (updatedQuantity == null) {
            return;
        }
        editData.items = {
            ...editData.items,
            [itemId]: updatedQuantity
        };
        setDirtyData(dirtyData => {
            const isDirty = updatedQuantity !== getReferenceItemQuantity(itemId);
            if (isDirty) {
                dirtyData.items.add(itemId);
            } else {
                dirtyData.items.delete(itemId);
            }
            return { ...dirtyData };
        });
    }, [editData, getReferenceItemQuantity, getUpdatedItemQuantity, includeItems, updateQp]);

    const updateItems = useCallback((items: ReadonlyRecord<number, SetStateAction<number>>): void => {
        if (!includeItems) {
            return;
        }
        const updatedItems = { ...editData.items };
        const dirtyItemsMap = new Map<number, boolean>();
        for (const [key, action] of Object.entries(items)) {
            const itemId = Number(key);
            if (itemId === GameItemConstants.QpItemId) {
                updateQp(action);
                continue;
            }
            const updatedQuantity = getUpdatedItemQuantity(itemId, action);
            if (updatedQuantity == null) {
                continue;
            }
            updatedItems[itemId] = updatedQuantity;
            const isDirty = updatedQuantity !== getReferenceItemQuantity(itemId);
            dirtyItemsMap.set(itemId, isDirty);
        }
        if (!dirtyItemsMap.size) {
            return;
        }
        editData.items = updatedItems;
        setDirtyData(dirtyData => {
            const dirtyItems = dirtyData.items;
            for (const [itemId, isDirty] of dirtyItemsMap.entries()) {
                if (isDirty) {
                    dirtyItems.add(itemId);
                } else {
                    dirtyItems.delete(itemId);
                }
            }
            return { ...dirtyData };
        });
        editData.items = updatedItems;
    }, [editData, getReferenceItemQuantity, getUpdatedItemQuantity, includeItems, updateQp]);

    const addServants = useCallback((gameIds: Iterable<number>, servantData: MasterServantUpdate): void => {
        if (!includeServants || !gameServantMap) {
            return;
        }
        const {
            servantsData: currentServantsData,
            bondLevels: currentBondLevels,
            costumes: currentCostumes
        } = editData;

        let lastServantInstanceId = editData.lastServantInstanceId;

        /**
         * New object for the bond level data. A new object instance is created to
         * conform with the hook specifications.
         */
        const bondLevels = { ...currentBondLevels };

        /**
         * New object for the unlocked costumes data. A new set instance instance is
         * created to conform with the hook specifications.
         */
        const costumes = new Set(currentCostumes);

        /**
         * Contains the new master servants (wrapped in a `MasterServantAggregatedData`
         * object) being added.
         */
        const newServantsData: Array<MasterServantAggregatedData> = [];

        /**
         * Construct new instance of a `MasterServant` object for each `gameId` and
         * add to the array. Unlocked costumes are also updated during this process.
         */
        for (const gameId of gameIds) {
            const newServant = MasterServantUtils.instantiate(++lastServantInstanceId);
            
            MasterServantUpdateUtils.applyToMasterServant(servantData, newServant, bondLevels, costumes);
            newServant.gameId = gameId;

            const newServantData = DataAggregationUtils.aggregateDataForMasterServant(newServant, gameServantMap);
            if (!newServantData) {
                continue;
            }
            newServantsData.push(newServantData);
        }

        /**
         * Updated servants array. A new array instance is created to conform with the
         * hook specifications.
         */
        const servantsData = [...currentServantsData, ...newServantsData];

        editData.servantsData = servantsData;
        editData.lastServantInstanceId = lastServantInstanceId;
        editData.bondLevels = bondLevels;
        editData.costumes = costumes;

        const isBondLevelsDirty = !ObjectUtils.isShallowEquals(referenceData.bondLevels, bondLevels);
        const isCostumesDirty = !CollectionUtils.isSetsEqual(referenceData.costumes, costumes);
        setDirtyData(dirtyData => {
            const dirtyServants = dirtyData.servants;
            for (const servantData of newServantsData) {
                dirtyServants.add(servantData.instanceId);
            }
            return {
                ...dirtyData,
                servantOrder: true,
                bondLevels: isBondLevelsDirty,
                costumes: isCostumesDirty
            };
        });
    }, [editData, gameServantMap, includeServants, referenceData]);

    const addServant = useCallback((gameId: number, servantData: MasterServantUpdate): void => {
        addServants([gameId], servantData);
    }, [addServants]);

    const updateServants = useCallback((instanceIds: Iterable<number>, update: MasterServantUpdate): void => {
        if (!includeServants) {
            return;
        }
        const {
            servantsData: currentServantsData,
            bondLevels: currentBondLevels,
            costumes: currentCostumes
        } = editData;

        const instanceIdSet = CollectionUtils.toReadonlySet(instanceIds);

        /**
         * New `servantsData` array. A new array instance is created to conform with the
         * hook specifications.
         */
        const servantsData: Array<MasterServantAggregatedData> = [];

        /**
         * New object for the bond level data. A new object is instantiated to conform
         * with the hook specifications.
         */
        const bondLevels = { ...currentBondLevels };

        /**
         * New object for the unlocked costumes data. A new set instance is created to
         * conform with the hook specifications.
         */
        const costumes = new Set(currentCostumes);

        /**
         * Keeps track of the dirty states of the updated servants.
         */
        const isDirties: Record<number, boolean> = {};

        for (const servantData of currentServantsData) {
            const instanceId = servantData.instanceId;
            /**
             * If the servant is not an update target, then just push to new array and
             * continue.
             */
            if (!instanceIdSet.has(instanceId)) {
                servantsData.push(servantData);
                continue;
            }
            /**
             * The target servant that the update is applied to. A cloned copy is used to
             * conform with the hook specifications.
             */
            const targetServant = MasterServantUtils.clone(servantData.masterServant);
            /**
             * Apply update to the target servant. Unlocked costumes are also updated here.
             */
            MasterServantUpdateUtils.applyToMasterServant(update, targetServant, bondLevels, costumes);

            const referenceServant = referenceData.servants.get(instanceId);
            const isDirty = isMasterServantChanged(referenceServant, targetServant);
            isDirties[instanceId] = isDirty;

            servantsData.push({
                ...servantData,
                masterServant: targetServant
            });
        }

        editData.servantsData = servantsData;
        editData.bondLevels = bondLevels;
        editData.costumes = costumes;

        const isBondLevelsDirty = !ObjectUtils.isShallowEquals(referenceData.bondLevels, bondLevels);
        const isCostumesDirty = !CollectionUtils.isSetsEqual(referenceData.costumes, costumes);
        setDirtyData(dirtyData => {
            const dirtyServants = dirtyData.servants;
            for (const [key, isDirty] of Object.entries(isDirties)) {
                const instanceId = Number(key);
                if (isDirty) {
                    dirtyServants.add(instanceId);
                } else {
                    dirtyServants.delete(instanceId);
                }
            }
            return {
                ...dirtyData,
                bondLevels: isBondLevelsDirty,
                costumes: isCostumesDirty
            };
        });
    }, [editData, includeServants, referenceData]);

    const updateServantOrder = useCallback((instanceIds: ReadonlyArray<number>): void => {
        if (!includeServants) {
            return;
        }
        const currentServantsData = editData.servantsData;

        /**
         * New `servantsData` array. A new array instance is created to conform with the
         * hook specifications.
         */
        const servantsData: Array<MasterServantAggregatedData> = [];

        /**
         * TODO This is an n^2 operation, may need some optimizations if servant list
         * gets too big.
         */
        for (const instanceId of instanceIds) {
            const index = currentServantsData.findIndex(servant => servant.instanceId === instanceId);
            if (index !== -1) {
                servantsData.push(currentServantsData[index]);
            }
        }

        editData.servantsData = servantsData;

        const isOrderDirty = DataEditUtils.isServantsOrderChanged(referenceData.servants, servantsData);
        setDirtyData(dirtyData => ({
            ...dirtyData,
            servantOrder: isOrderDirty
        }));
    }, [editData, referenceData, includeServants]);

    const deleteServants = useCallback((instanceIds: Iterable<number>): void => {
        if (!includeServants) {
            return;
        }
        const currentServantsData = editData.servantsData;

        const instanceIdSet = CollectionUtils.toReadonlySet(instanceIds);

        /**
         * Updated servants array with the specified IDs removed. A new array instance
         * is created to conform with the hook specifications.
         */
        const servantsData = currentServantsData.filter(({ instanceId }) => !instanceIdSet.has(instanceId));

        /**
         * If the last servant in terms of `instanceId` was deleted during this
         * operation, but was also added during the same edit session (not yet
         * persisted), then the it should not count towards the updated
         * `lastServantInstanceId` value.
         *
         * If this is the case, we decrement the updated `lastServantInstanceId` value
         * until it is no longer of a servant that was deleted during this operation, or
         * if it no longer greater than the reference value (the updated value should
         * never be less than the reference value).
         */
        /** */
        let lastServantInstanceId = editData.lastServantInstanceId;
        while (lastServantInstanceId > referenceData.lastServantInstanceId) {
            if (!instanceIdSet.has(lastServantInstanceId)) {
                break;
            }
            lastServantInstanceId--;
        }

        // TODO Also remove bond/costume data if the last instance of the servant is removed.

        editData.servantsData = servantsData;
        editData.lastServantInstanceId = lastServantInstanceId;

        const referenceServants = referenceData.servants;
        const isOrderDirty = DataEditUtils.isServantsOrderChanged(referenceServants, servantsData);
        setDirtyData(dirtyData => {
            const dirtyServants = dirtyData.servants;
            for (const instanceId of instanceIds) {
                /**
                 * If the reference data doesn't contain a servant with this `instanceId`, that
                 * means it was newly added. In this case, removing the servant should also
                 * reset its dirty state.
                 */
                if (!referenceServants.has(instanceId)) {
                    dirtyServants.delete(instanceId);
                } else {
                    dirtyServants.add(instanceId);
                }
            }
            return {
                ...dirtyData,
                servantOrder: isOrderDirty
            };
        });
    }, [editData, referenceData, includeServants]);

    const updateSoundtracks = useCallback((soundtrackIds: Iterable<number>): void => {
        if (!includeSoundtracks) {
            return;
        }
        /**
         * Construct a new `Set` here instead of using `DataEditUtils.toSet` to remove the possibility
         * the passed `soundtrackIds` (if it is a `Set`) from being modified externally.
         */
        editData.soundtracks = new Set(soundtrackIds);
        const isDirty = !CollectionUtils.isSetsEqual(editData.soundtracks, referenceData.soundtracks);
        setDirtyData(dirtyData => ({
            ...dirtyData,
            soundtracks: isDirty
        }));
    }, [editData, referenceData.soundtracks, includeSoundtracks]);

    const revertChanges = useCallback((): void => {
        if (!isDataDirty || !gameServantMap) {
            return;
        }
        const editData = cloneMasterAccountDataForEdit(masterAccount, gameServantMap, includeOptions);
        setEditData(editData);
        setDirtyData(getDefaultMasterAccountEditDirtyData());
    }, [gameServantMap, includeOptions, isDataDirty, masterAccount]);

    //#endregion


    //#region Back-end API functions

    const persistChanges = useCallback(async (): Promise<void> => {
        if (!masterAccount || !isDataDirty || isLoadingIndicatorActive) {
            return;
        }
        invokeLoadingIndicator();
        setAwaitingRequest(true);
        try {
            const update: MasterAccountUpdate = {
                _id: masterAccount._id
            };
            /**
             * Unfortunately, partial update is only supported at the root level, so if only
             * one nested data point is update, the entire root level object has to be
             * included. For example, if only the `qp` value was update, the rest of the
             * `resources` object will still have to be included in the update.
             */
            if (includeItems && (dirtyData.items.size || dirtyData.qp)) {
                update.resources = {
                    ...masterAccount.resources,
                    items: {
                        ...editData.items
                    },
                    qp: editData.qp
                };
            }
            if (includeServants) {
                if (dirtyData.servants.size || dirtyData.servantOrder) {
                    update.servants = editData.servantsData.map(DataAggregationUtils.getMasterServant) as Array<MasterServant>;
                    update.lastServantInstanceId = editData.lastServantInstanceId;
                }
                if (dirtyData.bondLevels) {
                    update.bondLevels = {
                        ...editData.bondLevels
                    };
                }
            }
            if (includeCostumes && dirtyData.costumes) {
                update.costumes = [
                    ...editData.costumes
                ];
            }
            if (includeSoundtracks && dirtyData.soundtracks) {
                update.soundtracks = [
                    ...editData.soundtracks
                ];
            }
            await masterAccountService.updateAccount(update);
        } finally {
            resetLoadingIndicator();
            setAwaitingRequest(false);
        }
    }, [
        editData,
        dirtyData,
        includeCostumes,
        includeItems,
        includeServants,
        includeSoundtracks,
        invokeLoadingIndicator,
        isDataDirty,
        isLoadingIndicatorActive,
        masterAccount,
        masterAccountService,
        resetLoadingIndicator
    ]);

    //#endregion


    return {
        masterAccountId,
        awaitingRequest,
        isDataDirty,
        masterAccountEditData: editData,
        updateCostumes,
        updateItem,
        updateItems,
        updateQp,
        addServant,
        addServants,
        updateServants,
        updateServantOrder,
        deleteServants,
        updateSoundtracks,
        revertChanges,
        persistChanges
    };

}

//#endregion
