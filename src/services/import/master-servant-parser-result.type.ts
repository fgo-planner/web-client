import { NewMasterServantUpdate } from '@fgo-planner/data-core';

/**
 * @deprecated
 */
export type MasterServantParserResult = {
    servantUpdates: Array<NewMasterServantUpdate>;
    errors: Array<string>;
    warnings: Array<string>;
};
