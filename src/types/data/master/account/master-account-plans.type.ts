import { BasicPlan, BasicPlanGroup } from '@fgo-planner/types';
import { Immutable } from '../../../internal';

export type PlanType = 'plan' | 'group';

// TODO Rename this to BasicPlans
export type MasterAccountPlans = Immutable<{
    plans: Array<BasicPlan>;
    planGroups: Array<BasicPlanGroup>;
}>;
