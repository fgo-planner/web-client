import { CollectionUtils, Functions } from '@fgo-planner/common-core';
import { EntityUtils } from '@fgo-planner/data-core';
import { BasicPlan, CreatePlan, PlanGroup, PlanGroupAggregatedData, PlanGrouping, PlanGroupingAggregatedData, UpdatePlanGrouping } from '@fgo-planner/data-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useInjectable } from '../../../hooks/dependency-injection/useInjectable';
import { PlanService } from '../../../services/data/plan/PlanService';
import { SubscribablesContainer } from '../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../utils/subscription/SubscriptionTopics';

//#region Type definitions

export type PlansDataEditHookResult = {
    planGroupingAggregatedData: PlanGroupingAggregatedData | undefined;
    createPlan(plan: Omit<CreatePlan, 'accountId'>): Promise<void>;
    deletePlans(planIds: Iterable<string>): Promise<void>;
    createPlanGroup(planGroup: Partial<PlanGroup>): Promise<void>;
};

//#endregion


//#region Internal helper/utility functions

const findAndAddPlans = (planMap: Map<string, BasicPlan>, planIds: Array<string>, target: Array<BasicPlan>): void => {
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

const aggregatePlanGroupingData = (plans: Array<BasicPlan>, planGrouping: PlanGrouping): PlanGroupingAggregatedData => {
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

//#endregion


//#region Hook function

export function usePlansDataEdit(): PlansDataEditHookResult {

    const planService = useInjectable(PlanService);

    /**
     * Whether there is an awaiting request to the back-end.
     */
    const [awaitingRequest, setAwaitingRequest] = useState<boolean>(false);

    /**
     * The current master account ID.
     */
    const masterAccountIdRef = useRef<string>();

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

    /**
     * Master account available changes subscription.
     */
    useEffect(() => {
        const masterAccountId = masterAccountIdRef.current;
        if (!masterAccountId) {
            return;
        }

        const onMasterAccountChangesAvailableSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.MasterAccountChangesAvailable)
            .subscribe(masterAccountChanges => {
                const currentAccountStatus = masterAccountChanges[masterAccountId];
                if (currentAccountStatus === 'Updated') {
                    console.debug(`Changes found for the current master account id=${masterAccountId}, automatically reloading data.`);
                    /**
                     * Silently reload the plans
                     */
                    loadPlanGroupingAggregatedData(masterAccountId);
                } else if (currentAccountStatus === 'Deleted') {
                    // TODO Handle case of deleted account.
                }
                // The `Created` status should not be possible here.
            });

        return () => onMasterAccountChangesAvailableSubscription.unsubscribe();
    }, [loadPlanGroupingAggregatedData]);

    /**
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(masterAccount => {
                if (!masterAccount) {
                    return undefined;
                }
                const masterAccountId = masterAccount._id;
                if (masterAccountId !== masterAccountIdRef.current) {
                    masterAccountIdRef.current = masterAccountId;
                    loadPlanGroupingAggregatedData(masterAccountId);
                }
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [loadPlanGroupingAggregatedData]);

    const createPlan = useCallback(async (plan: Omit<CreatePlan, 'accountId'>): Promise<void> => {
        const accountId = masterAccountIdRef.current;
        if (!accountId) {
            return;
        }
        await planService.createPlan({
            ...plan,
            accountId
        });
        loadPlanGroupingAggregatedData(accountId);
    }, [loadPlanGroupingAggregatedData, planService]);

    const deletePlans = useCallback(async (planIds: Iterable<string>): Promise<void> => {
        const accountId = masterAccountIdRef.current;
        if (!accountId) {
            return;
        }
        await planService.deletePlans(accountId, [...planIds]);
        loadPlanGroupingAggregatedData(accountId);
    }, [loadPlanGroupingAggregatedData, planService]);

    const createPlanGroup = useCallback(async (planGroup: Partial<PlanGroup>): Promise<void> => {
        const accountId = masterAccountIdRef.current;
        if (!accountId) {
            return;
        }
        const planGrouping = { accountId } as UpdatePlanGrouping;
        // TODO Implement this
        await planService.updatePlanGrouping(planGrouping);
        loadPlanGroupingAggregatedData(accountId);
    }, [loadPlanGroupingAggregatedData, planService]);

    return {
        planGroupingAggregatedData,
        createPlan,
        deletePlans,
        createPlanGroup
    };

}
