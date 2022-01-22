import { Plan, PlanGroup } from '@fgo-planner/types';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { MasterAccountPlans } from '../../../types/data';
import { HttpUtils as Http } from '../../../utils/http.utils';

@Injectable
export class PlanService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user/planner`;

    async addPlan(plan: Partial<Plan>): Promise<Plan> {
        return Http.put<Plan>(`${this._BaseUrl}/plan`, plan);
    }

    async addPlanGroup(planGroup: Partial<PlanGroup>): Promise<PlanGroup> {
        return Http.put<PlanGroup>(`${this._BaseUrl}/group`, planGroup);
    }

    async getPlan(id: string): Promise<Plan> {
        return Http.get<Plan>(`${this._BaseUrl}/plan/${id}`);
    }

    async getPlanGroup(id: string): Promise<PlanGroup> {
        return Http.get<PlanGroup>(`${this._BaseUrl}/group/${id}`);
    }

    async updatePlan(plan: Partial<Plan>): Promise<Plan> {
        return Http.post<Plan>(`${this._BaseUrl}/plan`, plan);
    }

    async updatePlanGroup(planGroup: Partial<PlanGroup>): Promise<PlanGroup> {
        return Http.post<PlanGroup>(`${this._BaseUrl}/group`, planGroup);
    }

    async deletePlan(id: string): Promise<Plan> {
        return Http.delete<Plan>(`${this._BaseUrl}/plan/${id}`);
    }

    async deletePlanGroup(id: string): Promise<PlanGroup> {
        return Http.delete<PlanGroup>(`${this._BaseUrl}/group/${id}`);
    }

    async getForAccount(accountId: string): Promise<MasterAccountPlans> {
        return Http.get<MasterAccountPlans>(`${this._BaseUrl}/account/${accountId}`);
    }

}
