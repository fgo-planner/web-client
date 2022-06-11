import { MasterServantBondLevel } from '@fgo-planner/types';
import { MasterServantPartial } from '../../types/data';

export type MasterServantParserResult = {
    masterServants: Array<MasterServantPartial>;
    bondLevels: Record<number, MasterServantBondLevel>;
    errors: Array<string>;
    warnings: Array<string>;
};
