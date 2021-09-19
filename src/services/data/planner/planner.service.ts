import { Plan, PlanGroup } from '@fgo-planner/types';
import { ReadonlyPartialArray } from '../../../types/internal';
import { HttpUtils as Http } from '../../../utils/http.utils';

export type AccountPlans = {
    plans: ReadonlyPartialArray<Plan>;
    planGroups: ReadonlyPartialArray<PlanGroup>;
};

export class PlannerService {

    private static readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user/planner`;

    static async addPlan(plan: Partial<Plan>): Promise<Plan> {
        return Http.put<Plan>(`${this._BaseUrl}/plan`, plan);
    }

    static async addPlanGroup(planGroup: Partial<PlanGroup>): Promise<PlanGroup> {
        return Http.put<PlanGroup>(`${this._BaseUrl}/group`, planGroup);
    }

    static async getPlan(id: string): Promise<Plan> {
        return Http.get<Plan>(`${this._BaseUrl}/plan/${id}`);
    }

    static async getPlanGroup(id: string): Promise<PlanGroup> {
        return Http.get<PlanGroup>(`${this._BaseUrl}/group/${id}`);
    }

    static async updatePlan(plan: Partial<Plan>): Promise<Plan> {
        return Http.post<Plan>(`${this._BaseUrl}/plan`, plan);
    }

    static async updatePlanGroup(planGroup: Partial<PlanGroup>): Promise<PlanGroup> {
        return Http.post<PlanGroup>(`${this._BaseUrl}/group`, planGroup);
    }

    static async deletePlan(id: string): Promise<Plan> {
        return Http.delete<Plan>(`${this._BaseUrl}/plan/${id}`);
    }

    static async deletePlanGroup(id: string): Promise<PlanGroup> {
        return Http.delete<PlanGroup>(`${this._BaseUrl}/group/${id}`);
    }

    static async getForAccount(accountId: string): Promise<AccountPlans> {
        return Http.get<AccountPlans>(`${this._BaseUrl}/account/${accountId}`);
    }

}
