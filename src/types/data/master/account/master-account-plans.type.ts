import { Plan, PlanGroup } from '@fgo-planner/types';
import { Immutable } from '../../../internal';

export type PlanType = 'plan' | 'group';

export type PlanLite = Immutable<Partial<Plan>>;
export type PlanGroupLite = Immutable<Partial<PlanGroup>>;

export type MasterAccountPlans = {
    readonly plans: ReadonlyArray<PlanLite>;
    readonly planGroups: ReadonlyArray<PlanGroupLite>;
};
