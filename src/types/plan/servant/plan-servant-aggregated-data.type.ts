import { Immutable } from '@fgo-planner/common-core';
import { PlanServant } from '@fgo-planner/data-core';
import { MasterServantAggregatedData } from '../../master/servant/master-servant-aggregated-data.type';

/**
 * DTO containing a `PlanServant` object, as well as the instance ID and the
 * source `MasterServant` and `GameServant` objects.
 */
export type PlanServantAggregatedData = MasterServantAggregatedData & {

    readonly planServant: Immutable<PlanServant>;

};
