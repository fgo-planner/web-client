import { CollectionUtils, Immutable, Nullable, ReadonlyRecord } from '@fgo-planner/common-core';
import { ExistingMasterServantUpdate, ImmutablePlan, InstantiatedServantUtils, NewMasterServantUpdate, Plan, PlanServant, PlanUpcomingResources } from '@fgo-planner/data-core';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../hooks/user-interface/use-loading-indicator.hook';
import { useBlockNavigation, UseBlockNavigationOptions } from '../../../hooks/utils/use-block-navigation.hook';
import { PlanService } from '../../../services/data/plan/plan.service';
import { MasterAccountEditData, useMasterAccountDataEditHook } from './use-master-account-data-edit.hook';
import { ReadonlyNumbers } from '../../../types/internal';

//#region Type definitions

/* eslint-disable @typescript-eslint/indent */

type PartialMasterAccountEditData = Pick<MasterAccountEditData,
    'costumes' |
    'items' |
    'qp' |
    'servants'
>;

type PlanEditData = Pick<ImmutablePlan,
    'name' |
    'description' |
    'enabled' |
    'servants' |
    // 'shared' |
    'targetDate' |
    'upcomingResources'
>;

type PlanInfo = Pick<Plan,
    'name' |
    'description' |
    'enabled' |
    // 'shared' |
    'targetDate'
>;

/* eslint-enable @typescript-eslint/indent */

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
type PlanEditReferenceData = Omit<PlanEditData, 'servants'> & Readonly<{
    servants: ReadonlyMap<number, Immutable<PlanServant>>;
}>;

type PlanDataEditHookResult = {
    masterAccountEditData: PartialMasterAccountEditData;
    planEditData: PlanEditData;
    /**
     * Updates the quantities of inventory items.
     *
     * Calls the `updateItems` function from the `useMasterAccountDataEditHook`
     * internally.
     */
    updateMasterItems: (items: ReadonlyRecord<number, SetStateAction<number>>) => void;
    /**
     * Updates the master servants with the corresponding `instanceIds` using the
     * given `ExistingMasterServantUpdate` object. 
     *
     * Calls the `updateServants` function from the `useMasterAccountDataEditHook`
     * internally.
     */
    updateMasterServants: (instanceIds: ReadonlyNumbers, update: ExistingMasterServantUpdate) => void;
    updatePlanInfo: (planInfo: PlanInfo) => void;
    /**
     * Adds a single servant using the given `NewMasterServantUpdate` object.
     * 
     * Calls the `addServants` function internally. 
     */
    addPlanServant: (servantData: NewMasterServantUpdate) => void;
    /**
     * Batch adds servants. Each added servant will be instantiated using the given
     * `NewMasterServantUpdate` object.
     */
    addPlanServants: (instanceIds: ReadonlyNumbers, servantData: NewMasterServantUpdate) => void;
    /**
     * Updates the servants with the corresponding `instanceIds` using the given
     * `ExistingMasterServantUpdate` object.
     */
    updatePlanServants: (instanceIds: ReadonlyNumbers, update: ExistingMasterServantUpdate) => void;
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
    deletePlanServants: (instanceIds: ReadonlyNumbers) => void;
    addUpcomingResources: (resources: PlanUpcomingResources) => void;
    updateUpcomingResources: (index: number, resources: PlanUpcomingResources) => void;
    deleteUpcomingResources: (index: number) => void;
    isMasterAccountDataDirty: boolean;
    isPlanDataDirty: boolean;
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
    servants: [],
    // shared: false,
    upcomingResources: []
});

const clonePlanDataForEdit = (plan: Nullable<ImmutablePlan>): PlanEditData => {
    if (!plan) {
        return getDefaultPlanEditData();
    }

    const {
        enabled,
        servants,
        upcomingResources
    } = plan;

    return {
        ...plan,
        enabled: { ...enabled },
        servants: [...servants], // TODO Need to deep clone.
        upcomingResources: [...upcomingResources], // TODO Need to deep clone.
    };
};

const getDefaultPlanReferenceData = (): PlanEditReferenceData => ({
    ...getDefaultPlanEditData(),
    servants: new Map()
});

const clonePlanDataForReference = (plan: Nullable<PlanEditData>): PlanEditReferenceData => {
    if (!plan) {
        return getDefaultPlanReferenceData();
    }
    const servants = CollectionUtils.mapIterableToMap(
        plan.servants,
        InstantiatedServantUtils.getInstanceId
    );
    return {
        ...plan,
        servants
    };
};

const getDefaultPlanEditDirtyData = (): PlanEditDirtyData => ({
    info: false,
    servants: new Set(),
    servantOrder: false,
    upcomingResources: false
});

const hasDirtyData = (dirtyData: any): boolean => (
    // TODO Implement this
    false
);

//#endregion


//#region Hook function

/**
 * Utility hook that manages the state of the plan and master account data
 * during editing. Returns the current state of the data and functions that can
 * be called to update the data.
 *
 * Uses the `useMasterAccountDataEditHook` internally to manage the master
 * account data.
 */
export function usePlanDataEditHook(planId: string): PlanDataEditHookResult {

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const planService = useInjectable(PlanService);

    const {
        masterAccountEditData,
        updateItems: updateMasterItems,
        updateServants: updateMasterServants,
        isDataDirty: isMasterAccountDataDirty,
        revertChanges: revertMasterAccountChanges,
        persistChanges: persistMasterAccountChanges
    } = useMasterAccountDataEditHook({
        blockNavigationOnDirtyData: false,
        includeCostumes: true,
        includeItems: true,
        includeServants: true
    });

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
    const isDataDirty = hasDirtyData(dirtyData);

    /**
     * Prevent user from navigating away if data is dirty.
     */
    useBlockNavigation(isDataDirty, BlockNavigationHookOptions);

    /**
     * Processes the plan data fetched from API server.
     */
    const handlePlanLoad = useCallback((plan: ImmutablePlan): void => {
        // TODO Sanitize plan against current master account data.
        const editData = clonePlanDataForEdit(plan);
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
        if (!planId) {
            console.error(`Invalid plan ID '${planId}'`);
        } else {
            invokeLoadingIndicator();
            const loadPlan = async (): Promise<void> => {
                const plan = await planService.getPlan(planId);
                handlePlanLoad(plan);
                resetLoadingIndicator();
            };
            loadPlan();
        }
    }, [handlePlanLoad, invokeLoadingIndicator, planId, planService, resetLoadingIndicator]);


    //#region Local create, update, delete functions

    const updatePlanInfo = useCallback((planInfo: PlanInfo): void => {

    }, []);

    const addPlanServant = useCallback((servantData: NewMasterServantUpdate): void => {

    }, []);

    const addPlanServants = useCallback((instanceIds: ReadonlyNumbers, servantData: NewMasterServantUpdate): void => {

    }, []);

    const updatePlanServants = useCallback((instanceIds: ReadonlyNumbers, update: ExistingMasterServantUpdate): void => {

    }, []);

    const updatePlanServantOrder = useCallback((instanceIds: ReadonlyArray<number>): void => {
        
    }, []);

    const deletePlanServants = useCallback((instanceIds: ReadonlyNumbers): void => {

    }, []);

    const addUpcomingResources = useCallback((resources: PlanUpcomingResources): void => {

    }, []);

    const updateUpcomingResources = useCallback((index: number, resources: PlanUpcomingResources): void => {

    }, []);

    const deleteUpcomingResources = useCallback((index: number): void => {

    }, []);
    
    const revertChanges = useCallback((): void => {
        if (isMasterAccountDataDirty) {
            revertMasterAccountChanges();
        }
    }, [isMasterAccountDataDirty, revertMasterAccountChanges]);
    
    //#endregion


    //#region Back-end API functions

    const persistChanges = useCallback(async (): Promise<void> => {
        if (isLoadingIndicatorActive) {
            return;
        }
        if (isMasterAccountDataDirty) {
            persistMasterAccountChanges();
        }
    }, [isLoadingIndicatorActive, isMasterAccountDataDirty, persistMasterAccountChanges]);

    //#endregion


    return {
        masterAccountEditData,
        planEditData: editData,
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
        isMasterAccountDataDirty,
        isPlanDataDirty: false,
        revertChanges,
        persistChanges
    };

};

//#endregion
