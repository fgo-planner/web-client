import { CollectionUtils, DateTimeUtils, Immutable, ImmutableArray, Nullable, ReadonlyDate, ReadonlyRecord } from '@fgo-planner/common-core';
import { ExistingMasterServantUpdate, ImmutablePlan, InstantiatedServantUtils, Plan, PlanServant, PlanServantUpdate, PlanServantUpdateUtils, PlanServantUtils, PlanUpcomingResources, PlanUtils } from '@fgo-planner/data-core';
import { SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../hooks/user-interface/use-loading-indicator.hook';
import { useBlockNavigation, UseBlockNavigationOptions } from '../../../hooks/utils/use-block-navigation.hook';
import { PlanService } from '../../../services/data/plan/plan.service';
import { MasterServantAggregatedData, PlanRequirements, PlanServantAggregatedData } from '../../../types';
import { DataAggregationUtils } from '../../../utils/data-aggregation.utils';
import { DataEditUtils } from './data-edit.utils';
import { MasterAccountDataEditHookOptions, MasterAccountEditData, useMasterAccountDataEdit } from './use-master-account-data-edit.hook';
import * as PlanComputationUtils from '../../../utils/plan/plan-computation.utils';

//#region Type definitions

/**
 * Return data forwarded from the `useMasterAccountDataEdit`.
 */
type PartialMasterAccountEditData = Pick<MasterAccountEditData, 'costumes' | 'items' | 'qp' | 'servantsData'>;

type PlanInfo = {
    name: string;
    description: string;
    targetDate?: ReadonlyDate;
    enabled: ImmutablePlan['enabled'];
    // shared: boolean;
};

type PlanEditData = PlanInfo & {
    servantsData: ReadonlyArray<PlanServantAggregatedData>;
    costumes: ReadonlySet<number>;
    upcomingResources: ImmutableArray<PlanUpcomingResources>;
};

/**
 * For internal use only by the hook. Keeps track of the which plan data have
 * been modified.
 */
type PlanEditDirtyData = {
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
type PlanEditReferenceData = Readonly<Omit<PlanEditData, 'servantsData'> & {
    servants: ReadonlyMap<number, Immutable<PlanServant>>;
}>;

type PlanDataEditHookResult = {
    masterAccountId: string | undefined;
    awaitingRequest: boolean;
    isMasterAccountDataDirty: boolean;
    isPlanDataDirty: boolean;
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
    updateMasterItems: (items: ReadonlyRecord<number, SetStateAction<number>>) => void;
    /**
     * Updates the master servants with the corresponding `instanceIds` using the
     * given `ExistingMasterServantUpdate` object. 
     *
     * Calls the `updateServants` function from the `useMasterAccountDataEdit`
     * internally.
     */
    updateMasterServants: (instanceIds: Iterable<number>, update: ExistingMasterServantUpdate) => void;
    updatePlanInfo: (planInfo: PlanInfo) => void;
    /**
     * Adds a single servant using the given `PlanServantUpdate` object.
     *
     * Calls the `addServants` function internally. 
     *
     * @param instanceId The instance ID of the corresponding master servant. If the
     * value already exists in the plan, then the function will silently return
     * without doing anything.
     */
    addPlanServant: (instanceId: number, servantData: PlanServantUpdate) => void;
    /**
     * Batch adds servants. Each added servant will be instantiated using the given
     * `PlanServantUpdate` object.
     *
     * @param instanceIds The instance IDs of the corresponding master servants.
     * Any values that already exist in the plan will be silently skipped.
     */
    addPlanServants: (instanceIds: Iterable<number>, servantData: PlanServantUpdate) => void;
    /**
     * Updates the servants with the corresponding `instanceIds` using the given
     * `PlanServantUpdate` object.
     */
    updatePlanServants: (instanceIds: Iterable<number>, update: PlanServantUpdate) => void;
    /**
     * Updates the servant ordering based on an array of `instanceId` values.
     * Assumes that the array contains a corresponding `instanceId` value for each
     * servant. Missing `instanceId` values will result in the corresponding servant
     * being removed.
     */
    updatePlanServantOrder: (instanceIds: ReadonlyArray<number>) => void;
    /**
     * Deletes the servants with the corresponding `instanceIds`.
     */
    deletePlanServants: (instanceIds: Iterable<number>) => void;
    addUpcomingResources: (resources: PlanUpcomingResources) => void;
    updateUpcomingResources: (index: number, resources: PlanUpcomingResources) => void;
    deleteUpcomingResources: (index: number) => void;
    revertChanges: () => void;
    persistChanges: () => Promise<void>;
};

//#endregion


//#region Constants

const BlockNavigationPrompt = 'There are unsaved changes. Are you sure you want to discard all changes and leave the page?';

const BlockNavigationConfirmButtonText = 'Discard';

const BlockNavigationHookOptions: UseBlockNavigationOptions = {
    confirmButtonLabel: BlockNavigationConfirmButtonText,
    prompt: BlockNavigationPrompt
};

// TODO Use `satisfies` keyword instead of `as` once Typescript is updated to version 4.9.
const masterAccountDataEditHookOptions = {
    blockNavigationOnDirtyData: false,
    includeCostumes: true,
    includeItems: true,
    includeServants: true,
    skipProcessOnActiveAccountChange: true
} as MasterAccountDataEditHookOptions;

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
    servantsData: [],
    costumes: CollectionUtils.emptySet(),
    upcomingResources: []
});

const clonePlanDataForEdit = (
    plan: Nullable<ImmutablePlan>,
    masterServantMap: ReadonlyMap<number, MasterServantAggregatedData>
): PlanEditData => {

    if (!plan) {
        return getDefaultPlanEditData();
    }

    const {
        name,
        description,
        targetDate,
        enabled,
        servants: planServants,
        costumes,
        upcomingResources
    } = plan;

    const servantsData = DataAggregationUtils.aggregateDataForPlanServants(
        planServants.map(PlanServantUtils.clone),
        masterServantMap
    );

    return {
        name,
        description,
        targetDate,
        enabled: {
            ...enabled
        },
        servantsData,
        costumes: new Set(costumes),
        upcomingResources: upcomingResources.map(PlanUtils.clonePlanUpcomingResources)
    };
};

const getDefaultPlanReferenceData = (): PlanEditReferenceData => ({
    ...getDefaultPlanEditData(),
    servants: CollectionUtils.emptyMap()
});

const clonePlanDataForReference = (plan: Nullable<ImmutablePlan>): PlanEditReferenceData => {
    if (!plan) {
        return getDefaultPlanReferenceData();
    }

    const {
        name,
        description,
        targetDate,
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
        targetDate,
        enabled,
        servants: CollectionUtils.mapIterableToMap(servants, InstantiatedServantUtils.getInstanceId),
        costumes: new Set(costumes),
        upcomingResources
    };
};

const getDefaultPlanEditDirtyData = (): PlanEditDirtyData => ({
    info: false,
    servants: new Set(),
    servantOrder: false,
    upcomingResources: false
});

const hasDirtyData = (dirtyData: PlanEditDirtyData): boolean => !!(
    dirtyData.info ||
    dirtyData.servants.size ||
    dirtyData.servantOrder ||
    dirtyData.upcomingResources
);

const isPlanServantChanged = (
    reference: Immutable<PlanServant> | undefined,
    planServant: Immutable<PlanServant>
): boolean => {
    if (!reference) {
        return true;
    }
    return !PlanServantUtils.isEqual(reference, planServant);
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
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const {
        masterAccountId,
        masterAccountEditData,
        updateItems: updateMasterItems,
        updateServants: updateMasterServants,
        awaitingRequest: awaitingMasterAccountRequest,
        isDataDirty: isMasterAccountDataDirty,
        revertChanges: revertMasterAccountChanges,
        persistChanges: persistMasterAccountChanges
    } = useMasterAccountDataEdit(masterAccountDataEditHookOptions);

    /**
     * The original plan data.
     */
    const [plan, setPlan] = useState<Nullable<ImmutablePlan>>();

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
     * Whether the tracked data is dirty.
     */
    const isPlanDataDirty = hasDirtyData(dirtyData);

    /**
     * Prevent user from navigating away if data is dirty.
     */
    useBlockNavigation(isPlanDataDirty, BlockNavigationHookOptions);

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
    const masterServantsDataMapRefRef = useRef<ReadonlyMap<number, MasterServantAggregatedData>>(CollectionUtils.emptyMap());

    /**
     * Rebuilds the master servants Map every time the source array instance
     * changes. Also updates the aggregated plan servant data with the updated
     * master servant instances.
     */
    useEffect((): void => {
        const masterServantsDataMapRef = CollectionUtils.mapIterableToMap(
            masterAccountEditData.servantsData,
            InstantiatedServantUtils.getInstanceId
        );
        masterServantsDataMapRefRef.current = masterServantsDataMapRef;

        /**
         * The updated `servantsData` array. A new array instance is created to conform
         * with the hook specifications.
         */
        const servantsData: Array<PlanServantAggregatedData> = [];
        for (const servantData of editData.servantsData) {
            const masterServantData = masterServantsDataMapRef.get(servantData.instanceId);
            if (!masterServantData) {
                continue;
            }
            servantsData.push({
                ...masterServantData,
                planServant: servantData.planServant
            });
        }
        editData.servantsData = servantsData;

        /**
         * No need to trigger re-rendering here via state update, etc. The recomputation
         * of the plan in the `useEffect` below should take care of it.
         */
    }, [editData, masterAccountEditData.servantsData]);

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
                servantsData: editData.servantsData,
                upcomingResources: editData.upcomingResources,
                costumes: editData.costumes
            },
            {
                items: masterAccountEditData.items,
                qp: masterAccountEditData.qp,
                costumes: masterAccountEditData.costumes,
            }
            // TODO Add previous plans
        );
        setPlanRequirements(planRequirements);
    }, [
        editData.costumes,
        editData.enabled,
        editData.servantsData,
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
        const editData = clonePlanDataForEdit(plan, masterServantsDataMapRefRef.current);
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
        editData.targetDate = DateTimeUtils.cloneDate(planInfo.targetDate);
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
            servantsData: currentServantsData,
            costumes: currentCostumes
        } = editData;

        /**
         * The set of instance IDs that already exist in the plan.
         */
        const existingInstanceIds = new Set(currentServantsData.map(InstantiatedServantUtils.getInstanceId));

        /**
         * New object for the target costumes data. A new set instance is created to
         * conform with the hook specifications.
         */
        const costumes = new Set(currentCostumes);

        /**
         * Contains the new plan servants (wrapped in a `PlanServantAggregatedData`
         * object) being added to the plan.
         */
        const newServantsData: Array<PlanServantAggregatedData> = [];

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
                masterServantsDataMapRefRef.current
            );
            if (!newServant) {
                continue;
            }
            PlanServantUpdateUtils.applyToPlanServant(servantData, newServant.planServant, costumes);
            newServantsData.push(newServant);
        }

        /**
         * If no new servants are being added (due to all instance IDs being skipped, or
         * missing source data), then return without doing anything else.
         */
        if (!newServantsData.length) {
            return;
        }

        /**
         * Updated `servantsData` array. A new array instance is created to conform with
         * the hook specifications.
         */
        const servantsData = [...currentServantsData, ...newServantsData];

        editData.servantsData = servantsData;
        editData.costumes = costumes;

        const isCostumesDirty = !CollectionUtils.isSetsEqual(referenceData.costumes, costumes);
        setDirtyData(dirtyData => {
            const dirtyServants = dirtyData.servants;
            for (const servantData of newServantsData) {
                dirtyServants.add(servantData.instanceId);
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
            servantsData: currentServantsData,
            costumes: currentCostumes
        } = editData;

        const instanceIdSet = CollectionUtils.toReadonlySet(instanceIds);

        /**
         * New `servantsData` array. A new array instance is created to conform with the
         * hook specifications.
         */
        const servantsData: Array<PlanServantAggregatedData> = [];

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

            servantsData.push({
                ...servantData,
                planServant: targetPlanServant
            });
        }

        editData.servantsData = servantsData;
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
        const currentServantsData = editData.servantsData;

        /**
         * New `servantsData` array. A new array instance is created to conform with the
         * hook specifications.
         */
        const servantsData: Array<PlanServantAggregatedData> = [];

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
    }, [editData, referenceData]);

    const deletePlanServants = useCallback((instanceIds: Iterable<number>): void => {
        const currentServantsData = editData.servantsData;

        const instanceIdSet = CollectionUtils.toReadonlySet(instanceIds);

        /**
         * Updated servants array with the specified IDs removed. A new array instance
         * is created to conform with the hook specifications.
         */
        const servantsData = currentServantsData.filter(({ instanceId }) => !instanceIdSet.has(instanceId));

        // TODO Also remove costume data if the last instance of the servant is removed.

        editData.servantsData = servantsData;

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
    }, [editData, referenceData]);

    const addUpcomingResources = useCallback((resources: PlanUpcomingResources): void => {
        // TODO Implement this
    }, []);

    const updateUpcomingResources = useCallback((index: number, resources: PlanUpcomingResources): void => {
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
            const editData = clonePlanDataForEdit(plan, masterServantsDataMapRefRef.current);
            setEditData(editData);
            setDirtyData(getDefaultPlanEditDirtyData());
        }
    }, [isMasterAccountDataDirty, isPlanDataDirty, plan, revertMasterAccountChanges]);

    //#endregion


    //#region Back-end API functions

    const persistChanges = useCallback(async (): Promise<void> => {
        if (isLoadingIndicatorActive || !plan) {
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
                    targetDate: editData.targetDate as Date,
                    enabled: {
                        ...editData.enabled
                    },
                    servants: editData.servantsData.map(servantData => servantData.planServant),
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
        editData,
        handlePlanLoad,
        invokeLoadingIndicator,
        isLoadingIndicatorActive,
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
        isPlanDataDirty,
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
        addUpcomingResources,
        updateUpcomingResources,
        deleteUpcomingResources,
        revertChanges,
        persistChanges
    };

};

//#endregion