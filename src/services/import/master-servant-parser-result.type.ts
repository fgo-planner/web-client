import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';

export type MasterServantParserResult = {
    masterServants: MasterServant[];
    bondLevels: Record<number, MasterServantBondLevel>;
    errors: string[];
    warnings: string[];
};
