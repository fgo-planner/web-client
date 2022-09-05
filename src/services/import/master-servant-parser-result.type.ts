import { NewMasterServantUpdate } from '../../types/internal';

/**
 * @deprecated
 */
export type MasterServantParserResult = {
    servantUpdates: Array<NewMasterServantUpdate>;
    errors: Array<string>;
    warnings: Array<string>;
};
