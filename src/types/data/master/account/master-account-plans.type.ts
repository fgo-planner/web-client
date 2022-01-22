import { Plan, PlanGroup } from '@fgo-planner/types';
import { Immutable } from '../../../internal';

export type MasterAccountPlans = Immutable<{
    plans: Array<Plan>;
    planGroups: Array<PlanGroup>;
}>;
