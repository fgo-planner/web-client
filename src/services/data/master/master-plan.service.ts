import { MasterPlan } from '@fgo-planner/types';
import { HttpUtils as Http } from '../../../utils/http.utils';

export class MasterPlanService {

    private static readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user/master-plan`;

    static async addPlan(masterPlan: Partial<MasterPlan>): Promise<MasterPlan> {
        return Http.put<MasterPlan>(`${this._BaseUrl}`, masterPlan);
    }

    static async getPlansForAccount(accountId: string): Promise<Partial<MasterPlan>[]> {
        return Http.get<Partial<MasterPlan>[]>(`${this._BaseUrl}/account/${accountId}`);
    }

    static async getPlan(id: string): Promise<MasterPlan> {
        return Http.get<MasterPlan>(`${this._BaseUrl}/${id}`);
    }

    static async updatePlan(masterPlan: MasterPlan): Promise<MasterPlan> {
        return Http.post<MasterPlan>(`${this._BaseUrl}`, masterPlan);
    }

    static async deletePlan(id: string): Promise<MasterPlan> {
        return Http.delete<MasterPlan>(`${this._BaseUrl}/${id}`);
    }

}
