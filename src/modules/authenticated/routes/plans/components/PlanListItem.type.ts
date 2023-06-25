import { Immutable } from '@fgo-planner/common-core';
import { BasicPlan, PlanGroupAggregatedData } from '@fgo-planner/data-types';
import { PlanConstants } from '../../../../../constants';

export type PlanListItem = Immutable<BasicPlan | PlanGroupAggregatedData> | typeof PlanConstants.UngroupedGroupId;
