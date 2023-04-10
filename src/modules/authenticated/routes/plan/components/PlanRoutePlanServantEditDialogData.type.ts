import { MasterServantAggregatedData, PlanServantUpdate } from '@fgo-planner/data-core';
import { EditDialogData } from '../../../../../types';

export type PlanRoutePlanServantEditDialogData = EditDialogData<{

    /**
     * The instance ID when adding a plan servant. This is not used when editing
     * existing servants.
     */
    instanceId: number;

    /**
     * The update data that is directly modified by the dialog.
     */
    update: PlanServantUpdate;

    /**
     * Array of servants that are available to be added to the plan. This data is
     * only read by the dialog and will not be modified.
     *
     * Only used in add mode; this is ignored in edit mode.
     */
    availableServants: ReadonlyArray<MasterServantAggregatedData>;

    /**
     * Set of costume IDs that are already unlocked. This is readonly and will not
     * be modified.
     */
    unlockedCostumes: ReadonlySet<number>;

}>;
