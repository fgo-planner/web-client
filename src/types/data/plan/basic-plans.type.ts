import { ImmutableBasicPlan, ImmutableBasicPlanGroup } from '@fgo-planner/data-core';

export type PlanType = 'plan' | 'group';

export type BasicPlans = Readonly<{
    plans: ReadonlyArray<ImmutableBasicPlan>;
    planGroups: ReadonlyArray<ImmutableBasicPlanGroup>;
}>;
