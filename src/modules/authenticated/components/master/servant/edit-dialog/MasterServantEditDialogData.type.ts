import { ReadonlyRecord } from '@fgo-planner/common-core';
import { InstantiatedServantBondLevel, MasterServantUpdate } from '@fgo-planner/data-core';
import { EditDialogData } from '../../../../../../types';

export type MasterServantEditDialogData = EditDialogData<{

    /**
     * The servant ID when adding a master servant. This is not used when editing
     * existing servants.
     */
    gameId: number;

    /**
     * The update data that is directly modified by the dialog.
     */
    update: MasterServantUpdate;

    /**
     * The current bond levels, for reference.
     */
    bondLevels: ReadonlyRecord<number, InstantiatedServantBondLevel>;
    
}>;
