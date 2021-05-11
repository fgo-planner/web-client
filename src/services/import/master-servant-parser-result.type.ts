import { MasterServant, MasterServantBondLevel } from '../../types';

export type MasterServantParserResult = {
    masterServants: MasterServant[];
    bondLevels: Record<number, MasterServantBondLevel>;
    errors: string[];
    warnings: string[];
};
