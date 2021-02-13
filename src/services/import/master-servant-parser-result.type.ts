import { MasterServant } from '../../types';

export type MasterServantParserResult = {
    masterServants: MasterServant[];
    errors: string[];
    warnings: string[];
};
