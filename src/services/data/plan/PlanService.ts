import { BasicPlans, Plan, PlanGroup } from '@fgo-planner/data-core';
import { Injectable } from '../../../decorators/dependency-injection/Injectable.decorator';
import { HttpUtils as Http } from '../../../utils/HttpUtils';
import { DataService } from '../DataService';

@Injectable
export class PlanService extends DataService {

    constructor() {
        super(`${process.env.REACT_APP_REST_ENDPOINT}/user/planner`);
    }

    async addPlan(plan: Partial<Plan>): Promise<Plan> {
        const promise = Http.put<Plan>(`${this._BaseUrl}/plan`, plan, this._transformPlan);
        return this._fetchWithLoadingIndicator(promise);
    }

    async addPlanGroup(planGroup: Partial<PlanGroup>): Promise<PlanGroup> {
        const promise = Http.put<PlanGroup>(`${this._BaseUrl}/group`, planGroup, this._transformPlanGroup);
        return this._fetchWithLoadingIndicator(promise);
    }

    async getPlan(id: string): Promise<Plan> {
        const promise = Http.get<Plan>(`${this._BaseUrl}/plan/${id}`, this._transformPlan);
        return this._fetchWithLoadingIndicator(promise);
    }

    async getPlanGroup(id: string): Promise<PlanGroup> {
        const promise = Http.get<PlanGroup>(`${this._BaseUrl}/group/${id}`, this._transformPlanGroup);
        return this._fetchWithLoadingIndicator(promise);
    }

    async updatePlan(plan: Partial<Plan>): Promise<Plan> {
        const promise = Http.post<Plan>(`${this._BaseUrl}/plan`, plan, this._transformPlan);
        return this._fetchWithLoadingIndicator(promise);
    }

    async updatePlanGroup(planGroup: Partial<PlanGroup>): Promise<PlanGroup> {
        const promise = Http.post<PlanGroup>(`${this._BaseUrl}/group`, planGroup, this._transformPlanGroup);
        return this._fetchWithLoadingIndicator(promise);
    }

    async deletePlan(planId: string): Promise<number> {
        return this.deletePlans([planId]);
    }

    async deletePlans(planIds: Array<string>): Promise<number> {
        const promise = Http.delete<number>(`${this._BaseUrl}/plan`, { planIds });
        return this._fetchWithLoadingIndicator(promise);
    }

    async deletePlanGroup(id: string): Promise<boolean> {
        const promise = Http.delete<boolean>(`${this._BaseUrl}/group/${id}`);
        return this._fetchWithLoadingIndicator(promise);
    }

    async getForAccount(accountId: string): Promise<BasicPlans> {
        const promise = Http.get<BasicPlans>(`${this._BaseUrl}/account/${accountId}`, this._transformAccountPlans.bind(this));
        return this._fetchWithLoadingIndicator(promise);
    }

    private _transformPlanGroup(planGroup: PlanGroup): PlanGroup {
        return Http.stringTimestampsToDate(planGroup);
    }

    private _transformPlan(plan: Plan): Plan {
        if (plan.targetDate) {
            plan.targetDate = new Date(plan.targetDate);
        }
        return Http.stringTimestampsToDate(plan);
    }

    private _transformAccountPlans(accountPlans: any): BasicPlans {
        for (const planGroup of accountPlans.planGroups) {
            this._transformPlanGroup(planGroup);
        }
        for (const plan of accountPlans.plans) {
            this._transformPlan(plan);
        }
        Http.stringTimestampsToDate(accountPlans.planList);
        return accountPlans;
    }

}
