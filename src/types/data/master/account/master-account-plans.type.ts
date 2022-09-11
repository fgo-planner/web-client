import { Immutable } from '@fgo-planner/common-core';
import { BasicPlan, BasicPlanGroup } from '@fgo-planner/data-core';

export type PlanType = 'plan' | 'group';

// TODO Rename this to BasicPlans
export type MasterAccountPlans = Immutable<{
    plans: Array<BasicPlan>;
    planGroups: Array<BasicPlanGroup>;
}>;
