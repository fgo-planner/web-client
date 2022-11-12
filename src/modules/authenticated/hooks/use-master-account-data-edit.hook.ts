import { CollectionUtils, Nullable, ObjectUtils, ReadonlyRecord } from '@fgo-planner/common-core';
import { ExistingMasterServantUpdate, GameItemConstants, ImmutableMasterAccount, ImmutableMasterServant, MasterAccountUpdate, MasterServant, InstantiatedServantBondLevel, MasterServantUpdateUtils, MasterServantUtils, NewMasterServantUpdate, InstantiatedServantUtils } from '@fgo-planner/data-core';
import { SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../hooks/user-interface/use-loading-indicator.hook';
import { useBlockNavigation, UseBlockNavigationOptions } from '../../../hooks/utils/use-block-navigation.hook';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { ReadonlyNumbers } from '../../../types/internal';
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
};

export type MasterAccountEditData = {
    bondLevels: ReadonlyRecord<number, InstantiatedServantBondLevel>;
    costumes: ReadonlySet<number>;
    items: ReadonlyRecord<number, number>;
    /**
     * This value will always be kept up-to-date during servant add and delete
     * operations.
     */
    lastServantInstanceId: number;
    qp: number;
    /**
     * Any edits to a servant (including bond levels and unlocked costumes) will
     * result in a new array to be instantiated for this field. In addition, the
     * servants that were edited (tracked by `instanceId`) will also be
     * reconstructed.
     */
    servants: ReadonlyArray<ImmutableMasterServant>;
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
    isDataDirty: boolean;
    revertChanges: () => void;
    persistChanges: () => Promise<void>;
};

type MasterAccountUpdateFunctions = {
    /**
     * Directly sets the unlocked costumes IDs. An alternative way to updating the
     * unlocked costumes is through the `MasterServantUpdate` object.
     */
    updateCostumes: (costumeIds: ReadonlyNumbers) => void;
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
     * Adds a single servant using the given `NewMasterServantUpdate` object.
     * 
     * Calls the `addServants` function internally. 
     */
    addServant: (servantData: NewMasterServantUpdate) => void;
    /**
     * Batch adds servants. Each added servant will be instantiated using the given
     * `NewMasterServantUpdate` object.
     */
    addServants: (servantIds: ReadonlyNumbers, servantData: NewMasterServantUpdate) => void;
    /**
     * Updates the servants with the corresponding `instanceIds` using the given
     * `ExistingMasterServantUpdate` object.
     */
    updateServants: (instanceIds: ReadonlyNumbers, update: ExistingMasterServantUpdate) => void;
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
    deleteServants: (instanceIds: ReadonlyNumbers) => void;
    updateSoundtracks: (soundtrackIds: ReadonlyNumbers) => void;
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
    masterAccountEditData: Pick<MasterAccountEditData, 'bondLevels' | 'servants'>;
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
    servants: [],
    soundtracks: CollectionUtils.emptySet()
});

const cloneMasterAccountDataForEdit = (
    masterAccount: Nullable<ImmutableMasterAccount>,
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
        result.servants = masterAccount.servants.map(MasterServantUtils.clone);
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

const hasDirtyData = (dirtyData: MasterAccountEditDirtyData): boolean => (
    !!(
        dirtyData.bondLevels ||
        dirtyData.costumes ||
        dirtyData.items.size ||
        dirtyData.qp ||
        dirtyData.servants.size ||
        dirtyData.servantOrder ||
        dirtyData.soundtracks
    )
);

const isServantChanged = (
    reference: ImmutableMasterServant | undefined,
    servant: ImmutableMasterServant
): boolean => {
    if (!reference) {
        return true;
    }
    return !MasterServantUtils.isEqual(reference, servant);
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
export function useMasterAccountDataEditHook(
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
export function useMasterAccountDataEditHook(
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
export function useMasterAccountDataEditHook(
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
export function useMasterAccountDataEditHook(
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
export function useMasterAccountDataEditHook(
    options?: MasterAccountDataEditHookOptions
): MasterAccountDataEditHookResult;

/**
 * Function implementation.
 */
export function useMasterAccountDataEditHook(
    options: MasterAccountDataEditHookOptions = {}
): MasterAccountDataEditHookResult {

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const masterAccountService = useInjectable(MasterAccountService);

    const {
        blockNavigationOnDirtyData = true,
        includeCostumes,
        includeItems,
        includeServants,
        includeSoundtracks
    } = options;

    /**
     * The original master account data.
     */
    const [masterAccount, setMasterAccount] = useState<Nullable<ImmutableMasterAccount>>();

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
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(masterAccount => {
                const editData = cloneMasterAccountDataForEdit(masterAccount, includeOptions);
                const referenceData = cloneMasterAccountDataForReference(masterAccount, includeOptions);
                setEditData(editData);
                setReferenceData(referenceData);
                setDirtyData(getDefaultMasterAccountEditDirtyData());
                setMasterAccount(masterAccount);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [includeOptions]);

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

    const updateCostumes = useCallback((costumeIds: ReadonlyNumbers): void => {
        if (!includeCostumes) {
            return;
        }
        /**
         * Construct a new `Set` here instead of using `DataEditUtils.toSet` to remove the possibility
         * the passed `costumeIds` (if it is a `Set`) from being modified externally.
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
                return;
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

    const addServants = useCallback((servantIds: ReadonlyNumbers, servantData: NewMasterServantUpdate): void => {
        if (!includeServants) {
            return;
        }
        const {
            servants: currentServants,
            bondLevels: currentBondLevels,
            costumes: currentCostumes
        } = editData;

        let lastServantInstanceId = editData.lastServantInstanceId;
        /**
         * New object for the bond level data. A new object is constructed for this to
         * conform with the hook specifications.
         */
        const bondLevels = { ...currentBondLevels };
        /**
         * New object for the unlocked costumes data. A new set is constructed for
         * this to conform with the hook specifications.
         */
        const costumes = new Set(currentCostumes);
        /**
         * Construct new instance of a `MasterServant` object for each `servantId` and
         * add to an array.
         */
        /** */
        const newServants = CollectionUtils.toReadonlyArray(servantIds).map(servantId => {
            const newServant = MasterServantUtils.instantiate(++lastServantInstanceId);
            MasterServantUpdateUtils.applyToMasterServant(servantData, newServant, bondLevels, costumes);
            newServant.gameId = servantId;
            return newServant;
        });
        /**
         * Updated servants array. A new array is constructed for this to conform
         * with the hook specifications.
         */
        const servants = [...currentServants, ...newServants];

        editData.servants = servants;
        editData.lastServantInstanceId = lastServantInstanceId;
        editData.bondLevels = bondLevels;
        editData.costumes = costumes;

        const isBondLevelsDirty = !ObjectUtils.isShallowEquals(referenceData.bondLevels, bondLevels);
        const isCostumesDirty = !CollectionUtils.isSetsEqual(referenceData.costumes, costumes);
        setDirtyData(dirtyData => {
            const dirtyServants = dirtyData.servants;
            for (const { instanceId } of newServants) {
                dirtyServants.add(instanceId);
            }
            return {
                ...dirtyData,
                servantOrder: true,
                bondLevels: isBondLevelsDirty,
                costumes: isCostumesDirty
            };
        });
    }, [editData, includeServants, referenceData]);

    const addServant = useCallback((servantData: NewMasterServantUpdate): void => {
        addServants([servantData.gameId], servantData);
    }, [addServants]);

    const updateServants = useCallback((instanceIds: ReadonlyNumbers, update: ExistingMasterServantUpdate): void => {
        if (!includeServants) {
            return;
        }
        const {
            servants: currentServants,
            bondLevels: currentBondLevels,
            costumes: currentCostumes
        } = editData;

        const instanceIdSet = CollectionUtils.toReadonlySet(instanceIds);

        /**
         * New array for the servants data. A new array is constructed for this to
         * conform with the hook specifications.
         */
        const servants = [];
        /**
         * New object for the bond level data. A new object is constructed for this to
         * conform with the hook specifications.
         */
        const bondLevels = { ...currentBondLevels };
        /**
         * New object for the unlocked costumes data. A new set is constructed for
         * this to conform with the hook specifications.
         */
        const costumes = new Set(currentCostumes);
        /**
         * Keeps track of the dirty states of the updated servants.
         */
        const isDirties: Record<number, boolean> = {};

        for (const servant of currentServants) {
            const { instanceId } = servant;
            /**
             * If the servant is not an update target, then just push to new array and
             * continue.
             */
            if (!instanceIdSet.has(instanceId)) {
                servants.push(servant);
                continue;
            }
            /**
             * Apply the edit to the target servant. The target servant object is
             * re-constructed to conform with the hook specifications.
             */
            /** */
            const targetServant = MasterServantUtils.clone(servant);
            MasterServantUpdateUtils.applyToMasterServant(update, targetServant, bondLevels, costumes);

            const referenceServant = referenceData.servants.get(instanceId);
            const isDirty = isServantChanged(referenceServant, targetServant);
            isDirties[instanceId] = isDirty;

            servants.push(targetServant);
        }

        editData.servants = servants;
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
        const { servants: currentServants } = editData;

        /**
         * New array for the servants data. A new array is constructed for this to
         * conform with the hook specifications.
         */
        const servants = [];

        /**
         * TODO This is an n^2 operation, may need some optimizations if servant list
         * gets too big.
         */
        for (const instanceId of instanceIds) {
            const index = currentServants.findIndex(servant => servant.instanceId === instanceId);
            if (index !== -1) {
                servants.push(currentServants[index]);
            }
        }

        editData.servants = servants;

        const isOrderDirty = DataEditUtils.isServantsOrderChanged(referenceData.servants, servants);
        setDirtyData(dirtyData => ({
            ...dirtyData,
            servantOrder: isOrderDirty
        }));
    }, [editData, referenceData.servants, includeServants]);

    const deleteServants = useCallback((instanceIds: ReadonlyNumbers): void => {
        if (!includeServants) {
            return;
        }
        const { servants: currentServants } = editData;

        const instanceIdSet = CollectionUtils.toReadonlySet(instanceIds);

        /**
         * Updated servants array. A new array is constructed for this to conform with
         * the hook specifications.
         */
        const servants = currentServants.filter(({ instanceId }) => !instanceIdSet.has(instanceId));

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

        editData.servants = servants;
        editData.lastServantInstanceId = lastServantInstanceId;

        const referenceServants = referenceData.servants;
        const isOrderDirty = DataEditUtils.isServantsOrderChanged(referenceServants, servants);
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

    const updateSoundtracks = useCallback((soundtrackIds: ReadonlyNumbers): void => {
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
        if (!isDataDirty) {
            return;
        }
        const editData = cloneMasterAccountDataForEdit(masterAccount, includeOptions);
        setEditData(editData);
        setDirtyData(getDefaultMasterAccountEditDirtyData());
    }, [includeOptions, isDataDirty, masterAccount]);

    //#endregion


    //#region Back-end API functions

    const persistChanges = useCallback(async (): Promise<void> => {
        if (!masterAccount || !isDataDirty || isLoadingIndicatorActive) {
            return;
        }
        invokeLoadingIndicator();
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
                update.servants = [
                    ...(editData.servants as Array<MasterServant>)
                ];
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
        try {
            await masterAccountService.updateAccount(update);
        } finally {
            resetLoadingIndicator();
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
