import { MasterServantUpdateNew } from '../../types/internal';

export type MasterServantParserResult = {
    servantUpdates: Array<MasterServantUpdateNew>;
    errors: Array<string>;
    warnings: Array<string>;
};
