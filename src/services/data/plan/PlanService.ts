import { BasicPlan, CreatePlan, Plan, PlanGrouping, UpdatePlan, UpdatePlanGrouping } from '@fgo-planner/data-core';
import { Injectable } from '../../../decorators/dependency-injection/Injectable.decorator';
import { HttpUtils as Http } from '../../../utils/HttpUtils';
import { DataService } from '../DataService';

@Injectable
export class PlanService extends DataService {

    constructor() {
        super(`${process.env.REACT_APP_REST_ENDPOINT}/user/planner`);
    }

    //#region Plan

    async createPlan(plan: CreatePlan): Promise<Plan> {
        const promise = Http.put<Plan>(`${this._BaseUrl}/plan`, plan);
        return this._fetchWithLoadingIndicator(promise);
    }

    async getPlan(id: string): Promise<Plan> {
        const promise = Http.get<Plan>(`${this._BaseUrl}/plan/${id}`);
        return this._fetchWithLoadingIndicator(promise);
    }

    async getPlansForAccount(accountId: string): Promise<Array<BasicPlan>> {
        const promise = Http.get<Array<BasicPlan>>(`${this._BaseUrl}/plans/${accountId}`);
        return this._fetchWithLoadingIndicator(promise);
    }

    async updatePlan(plan: UpdatePlan): Promise<Plan> {
        const promise = Http.post<Plan>(`${this._BaseUrl}/plan`, plan);
        return this._fetchWithLoadingIndicator(promise);
    }

    async deletePlan(accountId: string, planId: string): Promise<number> {
        return this.deletePlans(accountId, [planId]);
    }

    async deletePlans(accountId: string, planIds: Array<string>): Promise<number> {
        const promise = Http.delete<number>(`${this._BaseUrl}/plan`, { accountId, planIds });
        return this._fetchWithLoadingIndicator(promise);
    }

    //#endregion


    //#region Plan grouping

    async getPlanGroupingForAccount(accountId: string): Promise<PlanGrouping> {
        const promise = Http.get<PlanGrouping>(`${this._BaseUrl}/plan-grouping/${accountId}`);
        return this._fetchWithLoadingIndicator(promise);
    }

    async updatePlanGrouping(planGrouping: UpdatePlanGrouping): Promise<PlanGrouping> {
        const promise = Http.post<PlanGrouping>(`${this._BaseUrl}/plan-grouping`, planGrouping);
        return this._fetchWithLoadingIndicator(promise);
    }

    async deletePlanGroup(accountId: string, planGroupId: string, deletePlans: boolean): Promise<number> {
        return this.deletePlanGroups(accountId, [planGroupId], deletePlans);
    }

    async deletePlanGroups(accountId: string, planGroupIds: Array<string>, deletePlans: boolean): Promise<number> {
        const promise = Http.delete<number>(`${this._BaseUrl}/plan-grouping`, { accountId, planGroupIds, deletePlans });
        return this._fetchWithLoadingIndicator(promise);
    }

    //#endregion

}
