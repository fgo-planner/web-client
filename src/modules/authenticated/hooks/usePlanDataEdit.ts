import { CollectionUtils, Immutable, ImmutableArray, Nullable, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameItemConstants, InstantiatedServantUtils, MasterItemConstants, MasterServantAggregatedData, MasterServantUpdate, Plan, PlanServant, PlanServantAggregatedData, PlanServantUpdate, PlanServantUpdateUtils, PlanServantUtils, PlanResources, PlanUtils } from '@fgo-planner/data-core';
import React, { SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useInjectable } from '../../../hooks/dependency-injection/useInjectable';
import { useLoadingIndicator } from '../../../hooks/user-interface/useLoadingIndicator';
import { useBlockNavigation, UseBlockNavigationOptions } from '../../../hooks/utils/useBlockNavigation';
import { PlanService } from '../../../services/data/plan/PlanService';
import { PlanEnhancementRequirements, PlanRequirements } from '../../../types';
import { DataAggregationUtils } from '../../../utils/DataAggregationUtils';
import { MasterAccountUtils } from '../../../utils/master/MasterAccountUtils';
import { PlanComputationUtils } from '../../../utils/plan/PlanComputationUtils';
import { DataEditUtils } from './DataEditUtils';
import { MasterAccountDataEditHookOptions, MasterAccountEditData, useMasterAccountDataEdit } from './useMasterAccountDataEdit';

//#region Type definitions

/**
 * Return data forwarded from the `useMasterAccountDataEdit`.
 */
type PartialMasterAccountEditData = Pick<MasterAccountEditData, 'aggregatedServants' | 'costumes' | 'items' | 'qp'>;

type PlanInfo = {
    name: string;
    description: string;
    startDate?: string;
    endDate?: string;
    enabled: Immutable<Plan['enabled']>;
    // shared: boolean;
};

type PlanEditData = PlanInfo & {
    aggregatedServants: ReadonlyArray<PlanServantAggregatedData>;
    costumes: ReadonlySet<number>;
    upcomingResources: ImmutableArray<PlanResources>;
};

/**
 * For internal use only by the hook. Keeps track of the which plan data have
 * been modified.
 */
type PlanEditDirtyData = {
    costumes: boolean;
    info: boolean;
    servants: Set<number>;
    /**
     * This will be `true` if the order of the servants have changed or if any
     * servants have been added or removed.
     */
    servantOrder: boolean;
    upcomingResources: boolean;
};

/**
 * Contains unmodified plan data, slightly restructured for more efficient
 * comparison against current edit data to determine what has been modified.
 */
type PlanEditReferenceData = Readonly<Omit<PlanEditData, 'aggregatedServants'> & {
    servants: ReadonlyMap<number, Immutable<PlanServant>>;
}>;

type PlanDataEditHookResult = {
    masterAccountId: string | undefined;
    awaitingRequest: boolean;
    isMasterAccountDataDirty: boolean;
    isMasterAccountDataStale: boolean;
    isPlanDataDirty: boolean;
    isPlanDataStale: boolean;
    masterAccountEditData: PartialMasterAccountEditData;
    /**
     * Guaranteed to be stable between re-renders. A new instance will only be
     * constructed if changes are persisted or reverted.
     *
     * The sub-objects within this container object are readonly; new instances will
     * be created whenever the respective data is changed.
     */
    planEditData: PlanEditData;
    /**
     * The computed requirements for the plan at its current state. New instance
     * will be created each time the plan and/or master account data is updated.
     */
    planRequirements: PlanRequirements;
    /**
     * Updates the quantities of inventory items.
     *
     * Calls the `updateItems` function from the `useMasterAccountDataEdit`
     * internally.
     */
    updateMasterItems(items: ReadonlyRecord<number, SetStateAction<number>>): void;
    /**
     * Updates the master servants with the corresponding `instanceIds` using the
     * given `ExistingMasterServantUpdate` object. 
     *
     * Calls the `updateServants` function from the `useMasterAccountDataEdit`
     * internally.
     */
    updateMasterServants(instanceIds: Iterable<number>, update: MasterServantUpdate): void;
    updatePlanInfo(planInfo: PlanInfo): void;
    /**
     * Adds a single servant using the given `PlanServantUpdate` object.
     *
     * Calls the `addServants` function internally. 
     *
     * @param instanceId The instance ID of the corresponding master servant. If the
     * value already exists in the plan, then the function will silently return
     * without doing anything.
     */
    addPlanServant(instanceId: number, servantData: PlanServantUpdate): void;
    /**
     * Batch adds servants. Each added servant will be instantiated using the given
     * `PlanServantUpdate` object.
     *
     * @param instanceIds The instance IDs of the corresponding master servants.
     * Any values that already exist in the plan will be silently skipped.
     */
    addPlanServants(instanceIds: Iterable<number>, servantData: PlanServantUpdate): void;
    /**
     * Updates the servants with the corresponding `instanceIds` using the given
     * `PlanServantUpdate` object.
     */
    updatePlanServants(instanceIds: Iterable<number>, update: PlanServantUpdate): void;
    /**
     * Updates the servant ordering based on an array of `instanceId` values.
     * Assumes that the array contains a corresponding `instanceId` value for each
     * servant. Missing `instanceId` values will result in the corresponding servant
     * being removed.
     */
    updatePlanServantOrder(instanceIds: ReadonlyArray<number>): void;
    /**
     * Deletes the servants with the corresponding `instanceIds`.
     */
    deletePlanServants(instanceIds: Iterable<number>): void;
    fulfillPlanServants(instanceIds: Iterable<number>, remove?: boolean): void;
    addUpcomingResources(resources: PlanResources): void;
    updateUpcomingResources(index: number, resources: PlanResources): void;
    deleteUpcomingResources(index: number): void;
    reloadData(): Promise<void>;
    revertChanges(): void;
    persistChanges(): Promise<void>;
};

//#endregion


//#region Constants

const BlockNavigationPrompt = 'There are unsaved changes. Are you sure you want to discard all changes and leave the page?';

const BlockNavigationConfirmButtonText = 'Discard';

const BlockNavigationHookOptions: UseBlockNavigationOptions = {
    confirmButtonLabel: BlockNavigationConfirmButtonText,
    prompt: BlockNavigationPrompt
};

const MasterAccountDataEditOptions = {
    blockNavigationOnDirtyData: false,
    includeCostumes: true,
    includeResources: true,
    includeServants: true,
    skipProcessOnActiveAccountChange: true
} as const satisfies MasterAccountDataEditHookOptions;

//#endregion


//#region Internal helper/utility functions

const getDefaultPlanEditData = (): PlanEditData => ({
    name: '',
    description: '',
    enabled: {
        ascensions: true,
        skills: true,
        appendSkills: true,
        costumes: true
    },
    // shared: false,
    aggregatedServants: [],
    costumes: CollectionUtils.emptySet(),
    upcomingResources: []
});

const clonePlanDataForEdit = (
    plan: Nullable<Immutable<Plan>>,
    masterServantMap: ReadonlyMap<number, MasterServantAggregatedData>
): PlanEditData => {

    if (!plan) {
        return getDefaultPlanEditData();
    }

    const {
        costumes,
        description,
        enabled,
        endDate,
        name,
        servants: planServants,
        startDate,
        upcomingResources
    } = plan;

    const aggregatedServants = DataAggregationUtils.aggregateDataForPlanServants(
        planServants.map(PlanServantUtils.clone),
        masterServantMap
    );

    return {
        aggregatedServants,
        costumes: new Set(costumes),
        description,
        enabled: {
            ...enabled
        },
        endDate,
        name,
        startDate,
        upcomingResources: upcomingResources.map(PlanUtils.clonePlanResources)
    };
};

const getDefaultPlanReferenceData = (): PlanEditReferenceData => ({
    ...getDefaultPlanEditData(),
    servants: CollectionUtils.emptyMap()
});

const clonePlanDataForReference = (plan: Nullable<Immutable<Plan>>): PlanEditReferenceData => {
    if (!plan) {
        return getDefaultPlanReferenceData();
    }

    const {
        name,
        description,
        startDate,
        endDate,
        enabled,
        servants,
        costumes,
        upcomingResources
    } = plan;

    /**
     * No need to deep clone here as long as the source data is properly deep cloned
     * for the edit data.
     */

    return {
        name,
        description,
        startDate,
        endDate,
        enabled,
        servants: CollectionUtils.mapIterableToMap(servants, InstantiatedServantUtils.getInstanceId),
        costumes: new Set(costumes),
        upcomingResources
    };
};

const getDefaultPlanEditDirtyData = (): PlanEditDirtyData => ({
    costumes: false,
    info: false,
    servants: new Set(),
    servantOrder: false,
    upcomingResources: false
});

const hasDirtyData = (dirtyData: PlanEditDirtyData): boolean => !!(
    dirtyData.costumes ||
    dirtyData.info ||
    dirtyData.servants.size ||
    dirtyData.servantOrder ||
    dirtyData.upcomingResources
);

const isPlanServantChanged = (reference: Immutable<PlanServant> | undefined, planServant: Immutable<PlanServant>): boolean => {
    if (!reference) {
        return true;
    }
    return !PlanServantUtils.isEqual(reference, planServant);
};

const createNegativeItemUpdates = (requirements: PlanEnhancementRequirements): Record<number, React.SetStateAction<number>> => {
    const itemUpdates: Record<number, React.SetStateAction<number>> = {
        [GameItemConstants.QpItemId]: (current: number) => Math.max(MasterItemConstants.MinQuantity, current - requirements.qp)
    };
    for (const [key, value] of Object.entries(requirements.items)) {
        itemUpdates[Number(key)] = (current: number) => Math.max(MasterItemConstants.MinQuantity, current - value.total);
    }
    return itemUpdates;
};

//#endregion


//#region Hook function

/**
 * Utility hook that manages the state of the plan and master account data
 * during editing. Returns the current state of the data and functions that can
 * be called to update the data.
 *
 * Uses the `useMasterAccountDataEdit` internally to manage the master
 * account data.
 */
export function usePlanDataEdit(planId: string | undefined): PlanDataEditHookResult {

    const planService = useInjectable(PlanService);

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator
    } = useLoadingIndicator();

    const {
        masterAccountId,
        masterAccountEditData,
        updateItems: updateMasterItems,
        updateServants: updateMasterServants,
        awaitingRequest: awaitingMasterAccountRequest,
        isDataDirty: isMasterAccountDataDirty,
        isDataStale: isMasterAccountDataStale,
        reloadData: reloadMasterAccountData,
        revertChanges: revertMasterAccountChanges,
        persistChanges: persistMasterAccountChanges
    } = useMasterAccountDataEdit(MasterAccountDataEditOptions);

    /**
     * The original plan data.
     */
    const [plan, setPlan] = useState<Nullable<Immutable<Plan>>>();

    /**
     * A copy of the plan data for editing.
     */
    const [editData, setEditData] = useState<PlanEditData>(getDefaultPlanEditData);

    /**
     * Another copy of the plan data, for use as a reference in determining whether
     * data has been changed. This set of data will not be modified.
     */
    const [referenceData, setReferenceData] = useState<PlanEditReferenceData>(getDefaultPlanReferenceData);

    /**
     * Tracks touched/dirty data.
     */
    const [dirtyData, setDirtyData] = useState<PlanEditDirtyData>(getDefaultPlanEditDirtyData);

    /**
     * Whether the tracked plan data is dirty.
     */
    const isPlanDataDirty = hasDirtyData(dirtyData);

    /**
     * Whether the base plan data has been modified externally (ie.
     * through another instance of the app).
     * 
     * TODO Implement this.
     */
    const [isPlanDataStale, setIsPlanDataStale] = useState<boolean>(false);

    /**
     * Prevent user from navigating away if data is dirty.
     */
    useBlockNavigation(isMasterAccountDataDirty || isPlanDataDirty, BlockNavigationHookOptions);

    /**
     * Whether there is an awaiting request to the back-end from this hook.
     */
    const [awaitingPlanRequest, setAwaitingPlanRequest] = useState<boolean>(false);

    /**
     * Whether there is an awaiting request to the back-end, either from this hook
     * or from the `useMasterAccountDataEdit`.
     */
    const awaitingRequest = awaitingMasterAccountRequest || awaitingPlanRequest;

    /**
     * Map of master servants by its instance ID.
     */
    const aggregatedMasterServantsMapRef = useRef<ReadonlyMap<number, MasterServantAggregatedData>>(CollectionUtils.emptyMap());

    /**
     * Rebuilds the master servants Map every time the source array instance
     * changes. Also updates the aggregated plan servant data with the updated
     * master servant instances.
     */
    useEffect((): void => {
        const aggregatedMasterServantsMap = CollectionUtils.mapIterableToMap(
            masterAccountEditData.aggregatedServants,
            InstantiatedServantUtils.getInstanceId
        );
        aggregatedMasterServantsMapRef.current = aggregatedMasterServantsMap;

        /**
         * The updated `aggregatedServants` array. A new array instance is created to
         * conform with the hook specifications.
         */
        const aggregatedServants: Array<PlanServantAggregatedData> = [];
        for (const aggregatedPlanServant of editData.aggregatedServants) {
            const aggregatedMasterServant = aggregatedMasterServantsMap.get(aggregatedPlanServant.instanceId);
            if (!aggregatedMasterServant) {
                continue;
            }
            aggregatedServants.push({
                ...aggregatedMasterServant,
                planServant: aggregatedPlanServant.planServant
            });
        }
        editData.aggregatedServants = aggregatedServants;

        /**
         * No need to trigger re-rendering here via state update, etc. The recomputation
         * of the plan in the `useEffect` below should take care of it.
         */
    }, [editData, masterAccountEditData.aggregatedServants]);

    const [planRequirements, setPlanRequirements] = useState<PlanRequirements>(PlanComputationUtils.instantiatePlanRequirements);

    /**
     * Recomputes the plan requirements every time the dependent datasets change.
     * The datasets are listed individually in the hook dependency array, because
     * the container object (`editData` and `masterAccountEditData`) are designed to
     * keep the same reference between changes.
     */
    useEffect((): void => {
        if (!planId) {
            return;
        }
        const planRequirements = PlanComputationUtils.computePlanRequirements(
            {
                planId,
                enabled: editData.enabled,
                aggregatedServants: editData.aggregatedServants,
                upcomingResources: editData.upcomingResources,
                costumes: editData.costumes
            },
            {
                items: masterAccountEditData.items,
                qp: masterAccountEditData.qp,
                costumes: MasterAccountUtils.unlockedCostumesMapToIdSet(masterAccountEditData.costumes)
            }
            // TODO Add previous plans
        );
        setPlanRequirements(planRequirements);
    }, [
        editData.aggregatedServants,
        editData.costumes,
        editData.enabled,
        editData.upcomingResources,
        masterAccountEditData.costumes,
        masterAccountEditData.items,
        masterAccountEditData.qp,
        planId
    ]);

    /**
     * Processes the plan data fetched from API server.
     */
    const handlePlanLoad = useCallback((plan: Plan): void => {
        const editData = clonePlanDataForEdit(plan, aggregatedMasterServantsMapRef.current);
        const referenceData = clonePlanDataForReference(plan);
        setEditData(editData);
        setReferenceData(referenceData);
        setDirtyData(getDefaultPlanEditDirtyData());
        setPlan(plan);
    }, []);

    /**
     * Initial load of plan data.
     */
    useEffect(() => {
        /**
         * Don't load plan until master account data is loaded.
         */
        if (!masterAccountId) {
            return;
        }
        if (!planId) {
            console.error(`Invalid plan ID '${planId}'`);
        } else {
            invokeLoadingIndicator();
            const loadPlanAsync = async (): Promise<void> => {
                const plan = await planService.getPlan(planId);
                setTimeout(resetLoadingIndicator);
                handlePlanLoad(plan);
            };
            loadPlanAsync();
        }
    }, [handlePlanLoad, invokeLoadingIndicator, masterAccountId, planId, planService, resetLoadingIndicator]);


    //#region Local create, update, delete functions

    const updatePlanInfo = useCallback((planInfo: PlanInfo): void => {
        editData.name = planInfo.name;
        editData.description = planInfo.description;
        editData.startDate = planInfo.startDate;
        editData.endDate = planInfo.endDate;
        editData.enabled = {
            ...planInfo.enabled
        };
        // TODO Compute dirty data properly
        setDirtyData(dirtyData => ({
            ...dirtyData,
            info: true
        }));
    }, [editData]);

    const addPlanServants = useCallback((instanceIds: Iterable<number>, servantData: PlanServantUpdate): void => {

        const {
            aggregatedServants: currentServants,
            costumes: currentCostumes
        } = editData;

        /**
         * The set of instance IDs that already exist in the plan.
         */
        const existingInstanceIds = new Set(currentServants.map(InstantiatedServantUtils.getInstanceId));

        /**
         * New object for the target costumes data. A new set instance is created to
         * conform with the hook specifications.
         */
        const costumes = new Set(currentCostumes);

        /**
         * Contains the new plan servants (wrapped in a `PlanServantAggregatedData`
         * object) being added to the plan.
         */
        const newServants: Array<PlanServantAggregatedData> = [];

        /**
         * Construct new instance of a `PlanServant` object for each `instanceId` and
         * add to the array. Target costumes are also updated during this process.
         */
        for (const instanceId of instanceIds) {
            /**
             * Skip instance ID if it already exists in the plan.
             */
            if (existingInstanceIds.has(instanceId)) {
                console.warn(`Servant instanceId=${instanceId} was not added because it already exists in the plan.`);
                continue;
            }
            const newServant = DataAggregationUtils.aggregateDataForPlanServant(
                PlanServantUtils.instantiate(instanceId),
                aggregatedMasterServantsMapRef.current
            );
            if (!newServant) {
                continue;
            }
            PlanServantUpdateUtils.applyToPlanServant(servantData, newServant.planServant, costumes);
            newServants.push(newServant);
        }

        /**
         * If no new servants are being added (due to all instance IDs being skipped, or
         * missing source data), then return without doing anything else.
         */
        if (!newServants.length) {
            return;
        }

        /**
         * Updated `aggregatedServants` array. A new array instance is created to
         * conform with the hook specifications.
         */
        const aggregatedServants = [...currentServants, ...newServants];

        editData.aggregatedServants = aggregatedServants;
        editData.costumes = costumes;

        const isCostumesDirty = !CollectionUtils.isSetsEqual(referenceData.costumes, costumes);
        setDirtyData(dirtyData => {
            const dirtyServants = dirtyData.servants;
            for (const { instanceId } of newServants) {
                dirtyServants.add(instanceId);
            }
            return {
                ...dirtyData,
                servantOrder: true,
                costumes: isCostumesDirty
            };
        });
    }, [editData, referenceData]);

    const addPlanServant = useCallback((instanceId: number, servantData: PlanServantUpdate): void => {
        addPlanServants([instanceId], servantData);
    }, [addPlanServants]);

    const updatePlanServants = useCallback((instanceIds: Iterable<number>, update: PlanServantUpdate): void => {

        const {
            aggregatedServants: currentServants,
            costumes: currentCostumes
        } = editData;

        const instanceIdSet = CollectionUtils.toReadonlySet(instanceIds);

        /**
         * New `aggregatedServants` array. A new array instance is created to conform
         * with the hook specifications.
         */
        const aggregatedServants: Array<PlanServantAggregatedData> = [];

        /**
         * New object for the unlocked costumes data. A new set instance is created to
         * conform with the hook specifications.
         */
        const costumes = new Set(currentCostumes);

        /**
         * Keeps track of the dirty states of the updated servants.
         */
        const isDirties: Record<number, boolean> = {};

        for (const servantData of currentServants) {
            const instanceId = servantData.instanceId;
            /**
             * If the servant is not an update target, then just push to new array and
             * continue.
             */
            if (!instanceIdSet.has(instanceId)) {
                aggregatedServants.push(servantData);
                continue;
            }
            /**
             * The target `PlanServant` that the update is applied to. A cloned copy is used
             * to conform with the hook specifications.
             */
            const targetPlanServant = PlanServantUtils.clone(servantData.planServant);
            /**
             * Apply update to the target servant. Target costumes are also updated here.
             */
            PlanServantUpdateUtils.applyToPlanServant(update, targetPlanServant, costumes);

            const referenceServant = referenceData.servants.get(instanceId);
            const isDirty = isPlanServantChanged(referenceServant, targetPlanServant);
            isDirties[instanceId] = isDirty;

            aggregatedServants.push({
                ...servantData,
                planServant: targetPlanServant
            });
        }

        editData.aggregatedServants = aggregatedServants;
        editData.costumes = costumes;

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
                costumes: isCostumesDirty
            };
        });
    }, [editData, referenceData]);

    const updatePlanServantOrder = useCallback((instanceIds: ReadonlyArray<number>): void => {
        const currentServants = editData.aggregatedServants;

        /**
         * New `aggregatedServants` array. A new array instance is created to conform with the
         * hook specifications.
         */
        const aggregatedServants: Array<PlanServantAggregatedData> = [];

        /**
         * TODO This is an n^2 operation, may need some optimizations if servant list
         * gets too big.
         */
        for (const instanceId of instanceIds) {
            const index = currentServants.findIndex(servant => servant.instanceId === instanceId);
            if (index !== -1) {
                aggregatedServants.push(currentServants[index]);
            }
        }

        editData.aggregatedServants = aggregatedServants;

        const isOrderDirty = DataEditUtils.isServantsOrderChanged(referenceData.servants, aggregatedServants);
        setDirtyData(dirtyData => ({
            ...dirtyData,
            servantOrder: isOrderDirty
        }));
    }, [editData, referenceData]);

    const deletePlanServants = useCallback((instanceIds: Iterable<number>): void => {

        const {
            aggregatedServants: currentServants,
            costumes: currentCostumes
        } = editData;

        const instanceIdSet = CollectionUtils.toReadonlySet(instanceIds);

        /**
         * Updated servants array with the specified IDs removed. A new array instance
         * is created to conform with the hook specifications.
         */
        const servantsData = currentServants.filter(({ instanceId }) => !instanceIdSet.has(instanceId));
        editData.aggregatedServants = servantsData;

        /**
         * New object for the unlocked costumes data. A new set instance is created to
         * conform with the hook specifications.
         */
        const costumes = DataEditUtils.filterCostumesSet(currentCostumes, servantsData);
        editData.costumes = costumes;

        const referenceServants = referenceData.servants;
        const isCostumesDirty = !CollectionUtils.isSetsEqual(referenceData.costumes, costumes);
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
                costumes: isCostumesDirty,
                servantOrder: isOrderDirty
            };
        });
    }, [editData, referenceData]);

    const fulfillPlanServants = useCallback((instanceIds: Iterable<number>, remove = false): void => {
        const currentServants = editData.aggregatedServants;
        const computationOptions = PlanComputationUtils.parseComputationOptions(editData);

        const instanceIdSet = CollectionUtils.toReadonlySet(instanceIds);
        const requirements: Array<PlanEnhancementRequirements> = [];

        for (const servantData of currentServants) {
            if (!instanceIdSet.has(servantData.instanceId)) {
                continue;
            }
            const fulfillmentResult = PlanComputationUtils.fulfillServant(
                servantData,
                MasterAccountUtils.unlockedCostumesMapToIdSet(masterAccountEditData.costumes),
                editData.costumes,
                computationOptions
            );
            if (fulfillmentResult) {
                updateMasterServants([servantData.instanceId], fulfillmentResult.update);
                requirements.push(fulfillmentResult.requirements);
            }
        }

        const totalRequirements = PlanComputationUtils.sumEnhancementRequirements(requirements);
        const itemUpdates = createNegativeItemUpdates(totalRequirements);
        updateMasterItems(itemUpdates);

        if (remove) {
            deletePlanServants(instanceIds);
        }
    }, [deletePlanServants, editData, masterAccountEditData, updateMasterItems, updateMasterServants]);

    const addUpcomingResources = useCallback((resources: PlanResources): void => {
        // TODO Implement this
    }, []);

    const updateUpcomingResources = useCallback((index: number, resources: PlanResources): void => {
        // TODO Implement this
    }, []);

    const deleteUpcomingResources = useCallback((index: number): void => {
        // TODO Implement this
    }, []);

    const revertChanges = useCallback((): void => {
        if (isMasterAccountDataDirty) {
            revertMasterAccountChanges();
        }
        if (isPlanDataDirty) {
            const editData = clonePlanDataForEdit(plan, aggregatedMasterServantsMapRef.current);
            setEditData(editData);
            setDirtyData(getDefaultPlanEditDirtyData());
        }
    }, [isMasterAccountDataDirty, isPlanDataDirty, plan, revertMasterAccountChanges]);

    //#endregion


    //#region Back-end API functions

    const reloadData = useCallback(async (): Promise<void> => {
        if (awaitingRequest || !plan) {
            return;
        }
        if (isMasterAccountDataStale) {
            await reloadMasterAccountData();
        }
        if (isPlanDataStale) {
            try {
                setAwaitingPlanRequest(true);
                // TODO Implement this.
            } finally {
                setAwaitingPlanRequest(false);
            }
        }
    }, [awaitingRequest, isMasterAccountDataStale, isPlanDataStale, plan, reloadMasterAccountData]);

    const persistChanges = useCallback(async (): Promise<void> => {
        if (awaitingRequest || !plan) {
            return;
        }
        if (isMasterAccountDataDirty) {
            /**
             * No need to try/catch/finally here. Exceptions thrown here will be handled by
             * the caller.
             */
            await persistMasterAccountChanges();
        }
        if (isPlanDataDirty) {
            invokeLoadingIndicator();
            setAwaitingPlanRequest(true);
            try {
                const update: Plan = {
                    _id: plan._id,
                    accountId: plan.accountId,
                    name: editData.name,
                    description: editData.description,
                    shared: plan.shared,  // TODO Change this to editData.shared
                    startDate: editData.startDate,
                    endDate: editData.endDate,
                    enabled: {
                        ...editData.enabled
                    },
                    servants: editData.aggregatedServants.map(servantData => servantData.planServant),
                    costumes: [
                        ...editData.costumes
                    ],
                    upcomingResources: [
                        ...editData.upcomingResources
                    ]
                };
                const updatedPlan = await planService.updatePlan(update);
                handlePlanLoad(updatedPlan);
            } finally {
                resetLoadingIndicator();
                setAwaitingPlanRequest(false);
            }
        }
    }, [
        awaitingRequest,
        editData,
        handlePlanLoad,
        invokeLoadingIndicator,
        isMasterAccountDataDirty,
        isPlanDataDirty,
        persistMasterAccountChanges,
        plan,
        planService,
        resetLoadingIndicator
    ]);

    //#endregion


    return {
        masterAccountId,
        awaitingRequest,
        isMasterAccountDataDirty,
        isMasterAccountDataStale,
        isPlanDataDirty,
        isPlanDataStale,
        masterAccountEditData,
        planEditData: editData,
        planRequirements,
        updateMasterItems,
        updateMasterServants,
        updatePlanInfo,
        addPlanServant,
        addPlanServants,
        updatePlanServants,
        updatePlanServantOrder,
        deletePlanServants,
        fulfillPlanServants,
        addUpcomingResources,
        updateUpcomingResources,
        deleteUpcomingResources,
        reloadData,
        revertChanges,
        persistChanges
    };

}

//#endregion
