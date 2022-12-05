import { PlanServantUpdate } from '@fgo-planner/data-core';
import { EditDialogData } from '../../../../../types';

export type PlanRoutePlanServantEditDialogData = EditDialogData<{

    /**
     * The instance ID when adding a plan servant. This is not used when editing
     * existing servants.
     */
    instanceId: number;

    update: PlanServantUpdate;
    
}>;
