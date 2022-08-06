import { Plan, PlanGroup } from '@fgo-planner/types';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { MasterAccountPlans } from '../../../types/data';
import { HttpUtils as Http } from '../../../utils/http.utils';

@Injectable
export class PlanService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user/planner`;

    async addPlan(plan: Partial<Plan>): Promise<Plan> {
        return Http.put<Plan>(`${this._BaseUrl}/plan`, plan, this._planTransform);
    }

    async addPlanGroup(planGroup: Partial<PlanGroup>): Promise<PlanGroup> {
        return Http.put<PlanGroup>(`${this._BaseUrl}/group`, planGroup, this._planGroupTransform);
    }

    async getPlan(id: string): Promise<Plan> {
        return Http.get<Plan>(`${this._BaseUrl}/plan/${id}`, this._planTransform);
    }

    async getPlanGroup(id: string): Promise<PlanGroup> {
        return Http.get<PlanGroup>(`${this._BaseUrl}/group/${id}`, this._planGroupTransform);
    }

    async updatePlan(plan: Partial<Plan>): Promise<Plan> {
        return await Http.post<Plan>(`${this._BaseUrl}/plan`, plan, this._planTransform);
    }

    async updatePlanGroup(planGroup: Partial<PlanGroup>): Promise<PlanGroup> {
        return Http.post<PlanGroup>(`${this._BaseUrl}/group`, planGroup, this._planGroupTransform);
    }

    async deletePlan(id: string): Promise<boolean> {
        return Http.delete<boolean>(`${this._BaseUrl}/plan/${id}`);
    }

    async deletePlanGroup(id: string): Promise<boolean> {
        return Http.delete<boolean>(`${this._BaseUrl}/group/${id}`);
    }

    async getForAccount(accountId: string): Promise<MasterAccountPlans> {
        return Http.get<MasterAccountPlans>(`${this._BaseUrl}/account/${accountId}`, this._accountPlansTransform.bind(this));
    }

    private _planGroupTransform(planGroup: PlanGroup): PlanGroup {
        // TODO Also add add timestamps to PlanGroup
        // Http.stringTimestampsToDate(plan);
        return planGroup;
    }

    private _planTransform(plan: Plan): Plan {
        if (plan.targetDate) {
            plan.targetDate = new Date(plan.targetDate);
        }
        Http.stringTimestampsToDate(plan);
        return plan;
    }

    private _accountPlansTransform(accountPlans: any): MasterAccountPlans {
        for (const planGroup of accountPlans.planGroups) {
            this._planGroupTransform(planGroup);
        }
        for (const plan of accountPlans.plans) {
            this._planTransform(plan);
        }
        return accountPlans;
    }

}
