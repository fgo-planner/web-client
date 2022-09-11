import { Plan, PlanGroup } from '@fgo-planner/data-core';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { MasterAccountPlans } from '../../../types/data';
import { HttpUtils as Http } from '../../../utils/http.utils';

@Injectable
export class PlanService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user/planner`;

    async addPlan(plan: Partial<Plan>): Promise<Plan> {
        return Http.put<Plan>(`${this._BaseUrl}/plan`, plan, this._transformPlan);
    }

    async addPlanGroup(planGroup: Partial<PlanGroup>): Promise<PlanGroup> {
        return Http.put<PlanGroup>(`${this._BaseUrl}/group`, planGroup, this._transformPlanGroup);
    }

    async getPlan(id: string): Promise<Plan> {
        return Http.get<Plan>(`${this._BaseUrl}/plan/${id}`, this._transformPlan);
    }

    async getPlanGroup(id: string): Promise<PlanGroup> {
        return Http.get<PlanGroup>(`${this._BaseUrl}/group/${id}`, this._transformPlanGroup);
    }

    async updatePlan(plan: Partial<Plan>): Promise<Plan> {
        return await Http.post<Plan>(`${this._BaseUrl}/plan`, plan, this._transformPlan);
    }

    async updatePlanGroup(planGroup: Partial<PlanGroup>): Promise<PlanGroup> {
        return Http.post<PlanGroup>(`${this._BaseUrl}/group`, planGroup, this._transformPlanGroup);
    }

    async deletePlan(id: string): Promise<boolean> {
        return Http.delete<boolean>(`${this._BaseUrl}/plan/${id}`);
    }

    async deletePlanGroup(id: string): Promise<boolean> {
        return Http.delete<boolean>(`${this._BaseUrl}/group/${id}`);
    }

    async getForAccount(accountId: string): Promise<MasterAccountPlans> {
        return Http.get<MasterAccountPlans>(`${this._BaseUrl}/account/${accountId}`, this._transformAccountPlans.bind(this));
    }

    private _transformPlanGroup(planGroup: PlanGroup): PlanGroup {
        // TODO Also add add timestamps to PlanGroup
        // return Http.stringTimestampsToDate(plan);
        return planGroup;
    }

    private _transformPlan(plan: Plan): Plan {
        if (plan.targetDate) {
            plan.targetDate = new Date(plan.targetDate);
        }
        return Http.stringTimestampsToDate(plan);
    }

    private _transformAccountPlans(accountPlans: any): MasterAccountPlans {
        for (const planGroup of accountPlans.planGroups) {
            this._transformPlanGroup(planGroup);
        }
        for (const plan of accountPlans.plans) {
            this._transformPlan(plan);
        }
        return accountPlans;
    }

}
