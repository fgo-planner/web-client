import { CollectionUtils, Functions, Immutable } from '@fgo-planner/common-core';
import { EntityUtils } from '@fgo-planner/data-core';
import { BasicPlan, CreatePlan, CreatePlanGroup, PlanGroup, PlanGroupAggregatedData, PlanGrouping, PlanGroupingAggregatedData, UpdatePlanGrouping } from '@fgo-planner/data-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useInjectable } from '../../../../../hooks/dependency-injection/useInjectable';
import { MasterAccountService } from '../../../../../services/data/master/MasterAccountService';
import { PlanService } from '../../../../../services/data/plan/PlanService';
import { MasterAccountChangeType, MasterAccountMetadata } from '../../../../../types';
import { SubscribablesContainer } from '../../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../../utils/subscription/SubscriptionTopics';

//#region Type definitions

type OmitAccountId<T> = Omit<T, 'accountId'>;

export type PlansDataEditHookResult = {
    planGroupingAggregatedData: PlanGroupingAggregatedData | undefined;
    createPlan(createPlan: OmitAccountId<CreatePlan>): Promise<void>;
    deletePlans(planIds: Iterable<string>): Promise<void>;
    updatePlanGrouping(planGrouping: OmitAccountId<UpdatePlanGrouping>): Promise<void>;
    createPlanGroup(createPlanGroup: OmitAccountId<CreatePlanGroup>): Promise<void>;
};

//#endregion


//#region Internal helper/utility functions

const findAndAddPlans = (planMap: Map<string, BasicPlan>, planIds: ReadonlyArray<string>, target: Array<BasicPlan>): void => {
    for (const planId of planIds) {
        const plan = planMap.get(planId);
        if (!plan) {
            console.warn(`Plan id=${planId} could not be found.`);
            continue;
        }
        planMap.delete(planId);
        target.push(plan);
    }
};

const aggregatePlanGroupingData = (plans: Array<BasicPlan>, planGrouping: Immutable<PlanGrouping>): PlanGroupingAggregatedData => {
    const planMap = CollectionUtils.mapIterableToMap(plans, EntityUtils.getIdString, Functions.identity);
    const groups: Array<PlanGroupAggregatedData> = [];
    for (const group of planGrouping.groups) {
        const plans: Array<BasicPlan> = [];
        findAndAddPlans(planMap, group.plans, plans);
        groups.push({ ...group, plans });
    }
    const ungrouped: Array<BasicPlan> = [];
    findAndAddPlans(planMap, planGrouping.ungrouped, ungrouped);
    /**
     * Add the remaining plans to the ungrouped list.
     */
    if (planMap.size) {
        ungrouped.push(...planMap.values());
    }
    return {
        ungrouped,
        groups
    };
};

const disaggregatePlanGroupingData = (aggregatedData: PlanGroupingAggregatedData): PlanGrouping => {
    const groups: Array<PlanGroup> = [];
    for (const group of aggregatedData.groups) {
        const plans = group.plans.map(EntityUtils.getId);
        groups.push({ ...group, plans });
    }
    const ungrouped = aggregatedData.ungrouped.map(EntityUtils.getId);
    return {
        ungrouped,
        groups
    };
};

//#endregion


//#region Hook function

export const usePlansDataEdit = (): PlansDataEditHookResult => {

    const masterAccountService = useInjectable(MasterAccountService);
    const planService = useInjectable(PlanService);

    /**
     * Whether there is an awaiting request to the back-end.
     */
    const [awaitingRequest, setAwaitingRequest] = useState<boolean>(false);

    /**
     * The current master account's metadata.
     */
    const masterAccountMetadataRef = useRef<MasterAccountMetadata>();

    const [planGroupingAggregatedData, setPlanGroupingAggregatedData] = useState<PlanGroupingAggregatedData>();

    const loadPlanGroupingAggregatedData = useCallback(async (accountId: string): Promise<void> => {
        if (awaitingRequest) {
            return;
        }
        setAwaitingRequest(true);
        const plansPromise = planService.getPlansForAccount(accountId);
        const planGroupingPromise = planService.getPlanGroupingForAccount(accountId);
        try {
            const [plans, planGrouping] = await Promise.all([plansPromise, planGroupingPromise]);
            const planGroupingAggregatedData = aggregatePlanGroupingData(plans, planGrouping);
            setPlanGroupingAggregatedData(planGroupingAggregatedData);
        } finally {
            setAwaitingRequest(false);
        }
    }, [awaitingRequest, planService]);

    const updatePlanGroupingAggregatedData = useCallback(async (
        accountId: string,
        planGrouping: Immutable<PlanGrouping>
    ): Promise<void> => {
        if (awaitingRequest) {
            return;
        }
        setAwaitingRequest(true);
        try {
            const plans = await planService.getPlansForAccount(accountId);
            const planGroupingAggregatedData = aggregatePlanGroupingData(plans, planGrouping);
            setPlanGroupingAggregatedData(planGroupingAggregatedData);
        } finally {
            setAwaitingRequest(false);
        }
    }, [awaitingRequest, planService]);

    /**
     * Master account available changes subscription.
     */
    useEffect(() => {
        const masterAccountId = masterAccountMetadataRef.current?._id;
        if (!masterAccountId) {
            return;
        }

        const onMasterAccountChangesAvailableSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.MasterAccountChangesAvailable)
            .subscribe(masterAccountChanges => {
                const currentAccountStatus = masterAccountChanges[masterAccountId];
                if (!currentAccountStatus) {
                    console.debug(`Current master account id=${masterAccountId} was not found in the updated account list.`);
                } else if (currentAccountStatus === MasterAccountChangeType.Updated) {
                    console.debug(`Changes found for the current master account id=${masterAccountId}, automatically reloading data.`);
                    /**
                     * Silently reload the master account data (this will also reload and update the
                     * plans data).
                     */
                    masterAccountService.reloadCurrentAccount();
                } else if (currentAccountStatus === MasterAccountChangeType.Deleted) {
                    // TODO Handle case of deleted account.
                }
            });

        return () => onMasterAccountChangesAvailableSubscription.unsubscribe();
    }, [masterAccountService]);

    /**
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(masterAccount => {
                if (!masterAccount) {
                    return;
                }
                const currentMasterAccount = masterAccountMetadataRef.current;
                if (currentMasterAccount && !EntityUtils.isMoreRecent(currentMasterAccount, masterAccount)) {
                    return;
                }
                const {
                    _id: masterAccountId,
                    createdAt,
                    updatedAt,
                    planGrouping
                } = masterAccount;

                masterAccountMetadataRef.current = {
                    _id: masterAccountId,
                    createdAt,
                    updatedAt
                };
                updatePlanGroupingAggregatedData(masterAccountId, planGrouping);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [updatePlanGroupingAggregatedData]);

    const createPlan = useCallback(async (plan: OmitAccountId<CreatePlan>): Promise<void> => {
        const accountId = masterAccountMetadataRef.current?._id;
        if (!accountId) {
            return;
        }
        await planService.createPlan({ accountId, ...plan });
        loadPlanGroupingAggregatedData(accountId);
    }, [loadPlanGroupingAggregatedData, planService]);

    const deletePlans = useCallback(async (planIds: Iterable<string>): Promise<void> => {
        const accountId = masterAccountMetadataRef.current?._id;
        if (!accountId) {
            return;
        }
        await planService.deletePlans(accountId, [...planIds]);
        loadPlanGroupingAggregatedData(accountId);
    }, [loadPlanGroupingAggregatedData, planService]);

    const updatePlanGrouping = useCallback(async (planGrouping: OmitAccountId<UpdatePlanGrouping>): Promise<void> => {
        const accountId = masterAccountMetadataRef.current?._id;
        if (!accountId) {
            return;
        }
        const updated = await planService.updatePlanGrouping({ accountId, ...planGrouping });
        updatePlanGroupingAggregatedData(accountId, updated);
    }, [updatePlanGroupingAggregatedData, planService]);

    const createPlanGroup = useCallback(async (planGroup: OmitAccountId<CreatePlanGroup>): Promise<void> => {
        const accountId = masterAccountMetadataRef.current?._id;
        if (!accountId) {
            return;
        }
        const planGrouping = await planService.createPlanGroup({ accountId, ...planGroup });
        updatePlanGroupingAggregatedData(accountId, planGrouping);
    }, [updatePlanGroupingAggregatedData, planService]);

    return {
        planGroupingAggregatedData,
        createPlan,
        deletePlans,
        updatePlanGrouping,
        createPlanGroup
    };

};
