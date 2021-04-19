import { MasterPlanServantEnhancements } from './master-plan-servant-enhancements.type';

export type MasterPlanServant = {

    instanceId: number;

    enabled: {

        servant: boolean;

        ascensions: boolean;

        skills: boolean;

        costumes: boolean;

    };

    current: MasterPlanServantEnhancements;

    target: MasterPlanServantEnhancements;

};
