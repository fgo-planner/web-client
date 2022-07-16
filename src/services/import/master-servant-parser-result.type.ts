import { NewMasterServantUpdate } from '../../types/internal';

export type MasterServantParserResult = {
    servantUpdates: Array<NewMasterServantUpdate>;
    errors: Array<string>;
    warnings: Array<string>;
};
