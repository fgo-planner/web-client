import { MasterAccount, MasterServant, MasterServantBondLevel } from '@fgo-planner/data-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GameItemConstants } from '../../../constants';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../hooks/user-interface/use-loading-indicator.hook';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { ExistingMasterServantUpdate, Immutable, ImmutableArray, NewMasterServantUpdate, Nullable, ReadonlyRecord } from '../../../types/internal';
import { ArrayUtils } from '../../../utils/array.utils';
import { MapUtils } from '../../../utils/map.utils';
import { MasterServantUpdateUtils } from '../../../utils/master/master-servant-update.utils';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';
import { ObjectUtils } from '../../../utils/object.utils';
import { SetUtils } from '../../../utils/set.utils';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';


//#region Type definitions

type MasterAccountDataEditHookIncludeOptions = {
    includeCostumes?: boolean;
    includeItems?: boolean;
    includeServants?: boolean;
    includeSoundtracks?: boolean;
};

export type MasterAccountDataEditHookOptions = {
    showAlertOnDirtyUnmount?: boolean;
} & MasterAccountDataEditHookIncludeOptions;

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
    bondLevels: ReadonlyRecord<number, MasterServantBondLevel>;
    costumes: ReadonlySet<number>;
    items: ReadonlyRecord<number, number>;
    qp: number;
    /**
     * Use a `Map` for this to maintain order of insertion.
     */
    servants: ReadonlyMap<number, Immutable<MasterServant>>;
    soundtracks: ReadonlySet<number>;
};

type MasterAccountEditData = {
    bondLevels: ReadonlyRecord<number, MasterServantBondLevel>;
    costumes: ReadonlySet<number>;
    items: ReadonlyRecord<number, number>;
    qp: number;
    /**
     * Any edits to a servant (including bond levels and unlocked costumes) will
     * result in a new array to be instantiated for this field. In addition, the
     * servants that were edited (tracked by `instanceId`) will also be
     * reconstructed.
     */
    servants: ImmutableArray<MasterServant>;
    soundtracks: ReadonlySet<number>;
};

type IdNumbers = ReadonlyArray<number> | ReadonlySet<number>;

type MasterAccountUpdateFunctions = {
    updateCostumes: (costumeIds: IdNumbers) => void;
    updateItem: (itemId: number, quantity: number) => void;
    updateQp: (amount: number) => void;
    /**
     * Add a single servant using the given `NewMasterServantUpdate` object.
     * 
     * Calls the `addServants` function internally. 
     */
    addServant: (servantData: NewMasterServantUpdate) => void;
    /**
     * Batch add servants. Each added servant will be instantiated using the given
     * `NewMasterServantUpdate` object.
     */
    addServants: (servantIds: IdNumbers, servantData: NewMasterServantUpdate) => void;
    /**
     * Updates the servants with the corresponding `instanceIds` using the given
     * `ExistingMasterServantUpdate` object.
     */
    updateServants: (instanceIds: IdNumbers, update: ExistingMasterServantUpdate) => void;
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
    deleteServants: (instanceIds: IdNumbers) => void;
    updateSoundtracks: (soundtrackIds: IdNumbers) => void;
    revertChanges: () => void;
    persistChanges: () => Promise<void>;
};

/* eslint-disable max-len */

type MasterAccountDataEditHookCommon = {
    masterAccountId?: string;
    isDataDirty: boolean;
};

type MasterAccountDataEditHookData = MasterAccountDataEditHookCommon & {
    masterAccountEditData: MasterAccountEditData;
} & MasterAccountUpdateFunctions;

type MasterAccountDataEditHookDataCostumesSubset = MasterAccountDataEditHookCommon & {
    masterAccountEditData: Pick<MasterAccountEditData, 'costumes'>;
} & Pick<MasterAccountUpdateFunctions, 'updateCostumes' | 'revertChanges' | 'persistChanges'>;

type MasterAccountDataEditHookDataItemsSubset = MasterAccountDataEditHookCommon & {
    masterAccountEditData: Pick<MasterAccountEditData, 'items' | 'qp'>;
} & Pick<MasterAccountUpdateFunctions, 'updateItem' | 'updateQp' | 'revertChanges' | 'persistChanges'>;

type MasterAccountDataEditHookDataServantsSubset = MasterAccountDataEditHookCommon & {
    masterAccountEditData: Pick<MasterAccountEditData, 'bondLevels' | 'servants'>;
} & Pick<MasterAccountUpdateFunctions, 'addServant' | 'addServants' | 'updateServants' | 'updateServantOrder' | 'deleteServants' | 'revertChanges' | 'persistChanges'>;

type MasterAccountDataEditHookDataSoundtracksSubset = MasterAccountDataEditHookCommon & {
    masterAccountEditData: Pick<MasterAccountEditData, 'soundtracks'>;
} & Pick<MasterAccountUpdateFunctions, 'updateSoundtracks' | 'revertChanges' | 'persistChanges'>;

/* eslint-enable max-len */

//#endregion


//#region Internal helper/utility functions

const toArray = (idNumbers: IdNumbers): ReadonlyArray<number> => {
    if (Array.isArray(idNumbers)) {
        return idNumbers;
    }
    return [...idNumbers];
};

const toSet = (idNumbers: IdNumbers): ReadonlySet<number> => {
    if (idNumbers instanceof Set) {
        return idNumbers;
    }
    return new Set(idNumbers);
};

const getDefaultMasterAccountEditData = (): MasterAccountEditData => ({
    bondLevels: {},
    costumes: SetUtils.emptySet(),
    items: {},
    qp: 0,
    servants: [],
    soundtracks: SetUtils.emptySet()
});

const cloneMasterAccountDataForEdit = (
    masterAccount: Nullable<Immutable<MasterAccount>>,
    options: MasterAccountDataEditHookIncludeOptions
): MasterAccountEditData => {
    const result = getDefaultMasterAccountEditData();
    if (!masterAccount) {
        return result;
    }
    if (options.includeCostumes) {
        result.costumes = new Set(masterAccount.costumes);
    }
    if (options.includeItems) {
        result.items = ArrayUtils.mapArrayToObject(
            masterAccount.resources.items,
            item => item.itemId,
            item => item.quantity
        );
        result.qp = masterAccount.resources.qp;
    }
    if (options.includeServants) {
        result.bondLevels = { ...masterAccount.bondLevels };
        result.servants = masterAccount.servants.map(MasterServantUtils.clone);
    }
    if (options.includeSoundtracks) {
        result.soundtracks = new Set(masterAccount.soundtracks);
    }
    return result;
};

const getDefaultMasterAccountReferenceData = (): MasterAccountEditReferenceData => ({
    bondLevels: {},
    costumes: SetUtils.emptySet(),
    items: {},
    qp: 0,
    servants: MapUtils.emptyMap(),
    soundtracks: SetUtils.emptySet()
});

const cloneMasterAccountDataForReference = (
    masterAccount: Nullable<Immutable<MasterAccount>>,
    options: MasterAccountDataEditHookIncludeOptions
): Readonly<MasterAccountEditReferenceData> => {
    const result = getDefaultMasterAccountReferenceData();
    if (!masterAccount) {
        return result;
    }
    if (options.includeCostumes) {
        result.costumes = new Set(masterAccount.costumes);
    }
    if (options.includeItems) {
        result.items = ArrayUtils.mapArrayToObject(
            masterAccount.resources.items,
            item => item.itemId,
            item => item.quantity
        );
        result.qp = masterAccount.resources.qp;
    }
    if (options.includeServants) {
        result.bondLevels = masterAccount.bondLevels;
        result.servants = ArrayUtils.mapArrayToMap(
            masterAccount.servants,
            MasterServantUtils.getInstanceId,
            MasterServantUtils.clone
        );
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

const isDataDirty = (dirtyData: MasterAccountEditDirtyData): boolean => (
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

const isServantsChanged = (
    reference: Immutable<MasterServant> | undefined,
    servant: Immutable<MasterServant>
): boolean => {
    if (!reference) {
        return true;
    }
    return !MasterServantUtils.isEqual(reference, servant);
};
const isServantsOrderChanged = (
    reference: ReadonlyMap<number, Immutable<MasterServant>>,
    servants: Array<Immutable<MasterServant>>
): boolean => {
    if (reference.size !== servants.length) {
        return true;
    }
    const referenceInstanceIds = reference.keys();
    let index = 0; 
    for (const referenceInstanceId of referenceInstanceIds) {
        if (referenceInstanceId !== servants[index++].instanceId) {
            return true;
        }
    }
    return false;
};

//#endregion


//#region Hook function

/**
 * For costumes route.
 */
export function useMasterAccountDataEditHook(
    options: MasterAccountDataEditHookOptions & {
        includeCostumes: true;
        includeItems?: false;
        includeServants?: false;
        includeSoundtracks?: false;
    }
): MasterAccountDataEditHookDataCostumesSubset;
/**
 * For items route.
 */
export function useMasterAccountDataEditHook(
    options: MasterAccountDataEditHookOptions & {
        includeCostumes?: false;
        includeItems: true;
        includeServants?: false;
        includeSoundtracks?: false;
    }
): MasterAccountDataEditHookDataItemsSubset;
/**
 * For servants route.
 */
export function useMasterAccountDataEditHook(
    options: MasterAccountDataEditHookOptions & {
        includeCostumes: true;
        includeItems?: false;
        includeServants: true;
        includeSoundtracks?: false;
    }
): MasterAccountDataEditHookDataCostumesSubset & MasterAccountDataEditHookDataServantsSubset;
/**
 * For soundtracks route.
 */
export function useMasterAccountDataEditHook(
    options: MasterAccountDataEditHookOptions & {
        includeCostumes?: false;
        includeItems?: false;
        includeServants?: false;
        includeSoundtracks: true;
    }
): MasterAccountDataEditHookDataSoundtracksSubset;
/**
 *
 */
export function useMasterAccountDataEditHook(
    options?: MasterAccountDataEditHookOptions
): MasterAccountDataEditHookData;

export function useMasterAccountDataEditHook(
    {
        showAlertOnDirtyUnmount,
        includeCostumes,
        includeItems,
        includeServants,
        includeSoundtracks
    }: MasterAccountDataEditHookOptions = {}
): MasterAccountDataEditHookData {

    const { invokeLoadingIndicator, resetLoadingIndicator } = useLoadingIndicator();

    const masterAccountService = useInjectable(MasterAccountService);

    /**
     * The original master account data.
     */
    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();

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
     * Reconstruct the include options in a new object using `useMemo` so that it
     * doesn't inadvertently trigger recomputation of hooks even if the options
     * haven't changed.
     */
    const includeOptions = useMemo((): MasterAccountDataEditHookIncludeOptions => ({
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


    //#region Local create, update, delete functions

    const updateCostumes = useCallback((costumeIds: IdNumbers): void => {
        if (!includeCostumes) {
            return;
        }
        /**
         * Construct a new `Set` here instead of using `toSet` to remove the possibility
         * the passed `costumeIds` (if it is a `Set`) from being modified externally.
         */
        editData.costumes = new Set(costumeIds);
        const isDirty = !SetUtils.isEqual(editData.costumes, referenceData.costumes);
        setDirtyData(dirtyData => ({
            ...dirtyData,
            costumes: isDirty
        }));
    }, [editData, referenceData.costumes, includeCostumes]);

    const updateQp = useCallback((amount: number): void => {
        if (!includeItems) {
            return;
        }
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

    const updateItem = useCallback((itemId: number, quantity: number): void => {
        if (!includeItems) {
            return;
        }
        if (itemId === GameItemConstants.QpItemId) {
            updateQp(quantity);
            return;
        }
        let currentQuantity = editData.items[itemId];
        /**
         * If the user data doesn't have an entry for the item yet, then it will be
         * added with an initial value of zero.
         *
         * Note that this is only added to the edit data; the user will still have to
         * save the changes to persist the new entry.
         *
         * Also note that if the quantity is being updated to zero, the it will not be
         * considered a change, and the data will not be marked as dirty from the
         * update.
         */
        if (currentQuantity === undefined) {
            editData.items = {
                ...editData.items,
                [itemId]: currentQuantity = 0
            };
        }
        if (currentQuantity === quantity) {
            return;
        }
        editData.items = {
            ...editData.items,
            [itemId]: quantity
        };
        const isDirty = quantity !== (referenceData.items[itemId] || 0);
        setDirtyData(dirtyData => {
            const dirtyItems = dirtyData.items;
            if (isDirty) {
                dirtyItems.add(itemId);
            } else {
                dirtyItems.delete(itemId);
            }
            return { ...dirtyData };
        });
    }, [editData, referenceData.items, includeItems, updateQp]);

    const addServants = useCallback((servantIds: IdNumbers, servantData: NewMasterServantUpdate): void => {
        if (!includeServants) {
            return;
        }
        const {
            servants: currentServants,
            bondLevels: currentBondLevels,
            // unlockedCostumes
        } = editData;

        /**
         * Computed instance ID for the new servant.
         */
        let instanceId = MasterServantUtils.getLastInstanceId(currentServants) + 1;
        /**
         * New object for the bond level data. A new object is constructed for this to
         * conform with the hook specifications.
         */
        const bondLevels = { ...currentBondLevels };
        /**
         * Construct new instance of a `MasterServant` object for each `servantId` and
         * add to an array.
         */
        const newServants = toArray(servantIds).map(servantId => {
            const newServant = MasterServantUtils.instantiate(instanceId++);
            MasterServantUpdateUtils.applyFromUpdateObject(newServant, servantData, bondLevels);
            newServant.gameId = servantId;

            return newServant;
        });
        /**
         * Updated servants array. A new array is constructed for this to conform
         * with the hook specifications.
         */
        const servants = [...currentServants, ...newServants];

        editData.servants = servants;
        editData.bondLevels = bondLevels;
        // TODO Also update the unlocked costumes.

        const isBondLevelsDirty = !ObjectUtils.isShallowEquals(referenceData.bondLevels, bondLevels);
        setDirtyData(dirtyData => {
            const dirtyServants = dirtyData.servants;
            for (const { instanceId } of newServants) {
                dirtyServants.add(instanceId);
            }
            return {
                ...dirtyData,
                servantOrder: true,
                bondLevels: isBondLevelsDirty
            };
        });
    }, [editData, includeServants, referenceData.bondLevels]);

    const addServant = useCallback((servantData: NewMasterServantUpdate): void => {
        addServants([servantData.gameId], servantData);
    }, [addServants]);

    const updateServants = useCallback((instanceIds: IdNumbers, update: ExistingMasterServantUpdate): void => {
        if (!includeServants) {
            return;
        }
        const {
            servants: currentServants,
            bondLevels: currentBondLevels,
            // unlockedCostumes
        } = editData;

        const instanceIdSet = toSet(instanceIds);

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
         * Keeps track of the dirty states of the updated servants.
         */
        const isDirties: Record<number, boolean> = {};

        for (const servant of currentServants) {
            const {instanceId} = servant;
            /**
             * If the servant is not an update target, then just push to new array and
             * continue.
             */
            if (!instanceIdSet.has(instanceId)) {
                servants.push(servant);
                continue;
            }
            /*
             * Apply the edit to the target servant. The target servant object is
             * re-constructed to conform with the hook specifications.
             */
            const targetServant = MasterServantUtils.clone(servant);
            MasterServantUpdateUtils.applyFromUpdateObject(targetServant, update, bondLevels);

            const referenceServant = referenceData.servants.get(instanceId);
            const isDirty = isServantsChanged(referenceServant, targetServant);
            isDirties[instanceId] = isDirty;

            servants.push(targetServant);
        }

        editData.servants = servants;
        editData.bondLevels = bondLevels;
        // TODO Also update the unlocked costumes.

        const isBondLevelsDirty = !ObjectUtils.isShallowEquals(referenceData.bondLevels, bondLevels);
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
                bondLevels: isBondLevelsDirty
            };
        });
    }, [includeServants, editData, referenceData.bondLevels, referenceData.servants]);

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

        const isOrderDirty = isServantsOrderChanged(referenceData.servants, servants);
        setDirtyData(dirtyData => ({
            ...dirtyData,
            servantOrder: isOrderDirty
        }));
    }, [editData, referenceData.servants, includeServants]);

    const deleteServants = useCallback((instanceIds: IdNumbers): void => {
        if (!includeServants) {
            return;
        }
        const { servants: currentServants } = editData;

        const instanceIdSet = toSet(instanceIds);

        /**
         * Updated servants array. A new array is constructed for this to conform with
         * the hook specifications.
         */
        const servants = currentServants.filter(({ instanceId }) => !instanceIdSet.has(instanceId));

        editData.servants = servants;
        // TODO Also remove bond/costume data if the last instance of the servant is removed.

        const referenceServants = referenceData.servants;
        const isOrderDirty = isServantsOrderChanged(referenceServants, servants);
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
    }, [editData, referenceData.servants, includeServants]);

    const updateSoundtracks = useCallback((soundtrackIds: IdNumbers): void => {
        if (!includeSoundtracks) {
            return;
        }
        /**
         * Construct a new `Set` here instead of using `toSet` to remove the possibility
         * the passed `soundtrackIds` (if it is a `Set`) from being modified externally.
         */
        editData.soundtracks = new Set(soundtrackIds);
        const isDirty = !SetUtils.isEqual(editData.soundtracks, referenceData.soundtracks);
        setDirtyData(dirtyData => ({
            ...dirtyData,
            soundtracks: isDirty
        }));
    }, [editData, referenceData.soundtracks, includeSoundtracks]);

    const revertChanges = useCallback((): void => {
        const editData = cloneMasterAccountDataForEdit(masterAccount, includeOptions);
        setEditData(editData);
        setDirtyData(getDefaultMasterAccountEditDirtyData());
    }, [includeOptions, masterAccount]);

    //#endregion


    //#region Back-end API functions

    const persistChanges = useCallback(async (): Promise<void> => {
        if (!masterAccount || (!includeItems && !includeServants && !includeCostumes && !includeSoundtracks)) {
            return;
        }
        invokeLoadingIndicator();
        const update: Partial<MasterAccount> = {
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
                items: Object.entries(editData.items).map(([itemId, quantity]) => ({ itemId: Number(itemId), quantity })),
                qp: editData.qp
            };
        }
        if (includeServants) {
            if (dirtyData.servants.size || dirtyData.servantOrder) {
                update.servants = [
                    ...(editData.servants as Array<MasterServant>)
                ];
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
            resetLoadingIndicator();
        } catch (error: any) {
            resetLoadingIndicator();
            /*
             * Re-throw the error here. It is up to the component that calls the function to
             * determine how to handle the error.
             */
            throw error;
        }
    }, [
        editData,
        dirtyData,
        includeCostumes,
        includeItems,
        includeServants,
        includeSoundtracks,
        invokeLoadingIndicator,
        masterAccount,
        masterAccountService,
        resetLoadingIndicator
    ]);

    //#endregion

    return {
        masterAccountId: masterAccount?._id,
        isDataDirty: isDataDirty(dirtyData),
        masterAccountEditData: editData,
        updateCostumes,
        updateItem,
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
