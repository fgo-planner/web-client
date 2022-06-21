import { MasterAccount, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GameItemConstants } from '../../../constants';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../hooks/user-interface/use-loading-indicator.hook';
import { useForceUpdate } from '../../../hooks/utils/use-force-update.hook';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { Immutable, MasterServantUpdate, Nullable, ReadonlyRecord } from '../../../types/internal';
import { ArrayUtils } from '../../../utils/array.utils';
import { MasterServantUpdateUtils } from '../../../utils/master/master-servant-update.utils';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';

type MasterAccountDataEditHookIncludeOptions = {
    includeCostumes?: boolean;
    includeItems?: boolean;
    includeServants?: boolean;
    includeSoundtracks?: boolean;
};

export type MasterAccountDataEditHookOptions = {
    showAlertOnDirtyUnmount?: boolean;
} & MasterAccountDataEditHookIncludeOptions;

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
    servants: ReadonlyArray<MasterServant>;
    soundtracks: ReadonlySet<number>;
};

const getDefaultMasterAccountEditData = (): MasterAccountEditData => ({
    bondLevels: {},
    costumes: new Set<number>(),
    items: {},
    qp: 0,
    servants: [],
    soundtracks: new Set<number>()
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
        const items = masterAccount.resources.items;
        result.items = ArrayUtils.mapArrayToObject(items, item => item.itemId, item => item.quantity);
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

type MasterAccountUpdateFunctions = {
    updateCostumes: (costumeIds: Iterable<number>) => void;
    updateItem: (itemId: number, quantity: number) => void;
    updateQp: (amount: number) => void;
    addServant: (data: MasterServantUpdate) => void;
    updateServants: (instanceIds: Set<number>, data: MasterServantUpdate) => void;
    deleteServants: (instanceIds: Set<number>) => void;
    updateSoundtracks: (soundtrackIds: Iterable<number>) => void;
    revertChanges: () => void;
    persistChanges: () => Promise<void>;
};

type MasterAccountDataEditHookCommon = {
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
} & Pick<MasterAccountUpdateFunctions, 'updateServants' | 'revertChanges' | 'persistChanges'>;

type MasterAccountDataEditHookDataSoundtracksSubset = MasterAccountDataEditHookCommon & {
    masterAccountEditData: Pick<MasterAccountEditData, 'soundtracks'>;
} & Pick<MasterAccountUpdateFunctions, 'updateSoundtracks' | 'revertChanges' | 'persistChanges'>;

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

    const forceUpdate = useForceUpdate();

    const { invokeLoadingIndicator, resetLoadingIndicator } = useLoadingIndicator();

    const masterAccountService = useInjectable(MasterAccountService);

    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();
    const [editData, setEditData] = useState<MasterAccountEditData>(getDefaultMasterAccountEditData);
    const [isDataDirty, setIsDataDirty] = useState<boolean>(false);

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

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(masterAccount => {
                const editData = cloneMasterAccountDataForEdit(masterAccount, includeOptions);
                setEditData(editData);
                setMasterAccount(masterAccount);
                setIsDataDirty(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [includeOptions]);


    //#region Local create, update, delete functions

    const updateCostumes = useCallback((costumeIds: Iterable<number>): void => {
        if (!includeCostumes) {
            return;
        }
        editData.costumes = new Set(costumeIds);
        setIsDataDirty(true); // TODO Track changes properly
        forceUpdate();
    }, [editData, forceUpdate, includeCostumes]);

    const updateQp = useCallback((amount: number): void => {
        if (!includeItems) {
            return;
        }
        editData.qp = amount;
        setIsDataDirty(true); // TODO Track changes properly
        forceUpdate();
    }, [editData, forceUpdate, includeItems]);

    const updateItem = useCallback((itemId: number, quantity: number): void => {
        if (!includeItems) {
            return;
        }
        if (itemId === GameItemConstants.QpItemId) {
            updateQp(quantity);
        } else {
            if (editData.items[itemId] === quantity) {
                return; // No change
            }
            editData.items = {
                ...editData.items,
                [itemId]: quantity
            };
            setIsDataDirty(true); // TODO Track changes properly
            forceUpdate();
        }
    }, [editData, forceUpdate, includeItems, updateQp]);

    const addServant = useCallback((update: MasterServantUpdate): void => {
        if (!includeServants) {
            return;
        }

        const {
            servants,
            bondLevels,
            // unlockedCostumes
        } = editData;

        /**
         * Computed instance ID for the new servant.
         */
        const instanceId = MasterServantUtils.getLastInstanceId(servants) + 1;
        /**
         * New instance of a `MasterServant` object. This will be populated with the
         * data returned by the dialog.
         */
        const newServant = MasterServantUtils.instantiate(instanceId);
        MasterServantUpdateUtils.applyFromUpdatePayload(newServant, update, bondLevels);
        /*
         * Rebuild the array with the new servant included to conform with the context
         * specifications.
         */
        editData.servants = [...servants, newServant];
        // TODO Also update the unlocked costumes.
        setIsDataDirty(true); // TODO Track changes properly
        forceUpdate();
    }, [editData, forceUpdate, includeServants]);

    const updateServants = useCallback((instanceIds: Set<number>, update: MasterServantUpdate): void => {
        if (!includeServants) {
            return;
        }

        const {
            servants,
            bondLevels,
            // unlockedCostumes
        } = editData;

        /**
         * Updated servants array. A new array is constructed for this to conform with
         * the context specifications.
         */
        const updatedServants = [];

        for (const servant of servants) {
            /*
             * If the servant is not an update target, then just add it to the new array and
             * continue.
             */
            if (!instanceIds.has(servant.instanceId)) {
                updatedServants.push(servant);
                continue;
            }
            /*
             * Apply the edit to the target servant. The target servant object is
             * re-constructed to conform with the context specifications.
             */
            const targetServant = { ...servant };
            MasterServantUpdateUtils.applyFromUpdatePayload(targetServant, update, bondLevels);
            // TODO Set dirty...
            updatedServants.push(targetServant);
        }
        // TODO Set dirty...
        editData.servants = updatedServants;
        // TODO Also update the unlocked costumes.
        setIsDataDirty(true); // TODO Track changes properly
        forceUpdate();
    }, [editData, forceUpdate, includeServants]);

    const deleteServants = useCallback((instanceIds: Set<number>): void => {
        if (!includeServants) {
            return;
        }

        const { servants } = editData;

        /**
         * Updated servants array. A new array is constructed for this to conform with
         * the context specifications.
         */
        const updatedServants = servants.filter(({ instanceId }) => !instanceIds.has(instanceId));
        // TODO Set dirty...
        editData.servants = updatedServants;
        // TODO Also remove bond/costume data if the last instance of the servant is removed.
        setIsDataDirty(true); // TODO Track changes properly
        forceUpdate();
    }, [editData, forceUpdate, includeServants]);

    const updateSoundtracks = useCallback((soundtrackIds: Iterable<number>): void => {
        if (!includeSoundtracks) {
            return;
        }
        editData.soundtracks = new Set(soundtrackIds);
        setIsDataDirty(true); // TODO Track changes properly
        forceUpdate();
    }, [editData, forceUpdate, includeSoundtracks]);

    const revertChanges = useCallback((): void => {
        const editData = cloneMasterAccountDataForEdit(masterAccount, includeOptions);
        setEditData(editData);
        setIsDataDirty(false);
    }, [includeOptions, masterAccount]);

    //#endregion


    //#region Back-end API functions

    const persistChanges = useCallback(async (): Promise<void> => {
        if (!masterAccount || (!includeItems && !includeServants && !includeCostumes && !includeSoundtracks)) {
            return;
        }
        invokeLoadingIndicator();
        // TODO Only update dirty data types
        const update: Partial<MasterAccount> = {
            _id: masterAccount._id
        };
        if (includeItems) {
            update.resources = {
                ...masterAccount.resources,
                items: Object.entries(editData.items).map(([itemId, quantity]) => ({ itemId: Number(itemId), quantity })),
                qp: editData.qp
            };
        }
        if (includeServants) {
            update.servants = [
                ...editData.servants
            ];
            update.bondLevels = {
                ...editData.bondLevels
            };
        }
        if (includeCostumes) {
            update.costumes = [
                ...editData.costumes
            ];
        }
        if (includeSoundtracks) {
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
        isDataDirty,
        masterAccountEditData: editData,
        updateCostumes,
        updateItem,
        updateQp,
        addServant,
        updateServants,
        deleteServants,
        updateSoundtracks,
        revertChanges,
        persistChanges
    };

}
