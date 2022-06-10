import { MasterAccount, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { createContext } from 'react';
import { ReadonlySet } from 'typescript';
import { Immutable, MasterServantUpdate, Nullable } from '../../../types/internal';

// TODO Move this to a utils file or something.
const DefaultFunction = () => {};

export type MasterAccountDataContextProps = Readonly<{
    masterAccountOriginalData?: Nullable<Immutable<MasterAccount>>;
    /**
     * Copy of the master account data for editing. The `edit` object from the
     * context is guaranteed to be the same instance unless the data is re-cloned
     * (due to data being saved, reverted, etc.), although the fields within the
     * object may change.
     */
    masterAccountEditData: Immutable<{
        /**
         * The same instance of this map is always returned unless a re-clone of the
         * edit data is triggered.
         */
        bondLevels: Record<number, MasterServantBondLevel>;
        costumes: ReadonlySet<number>;
        /**
         * Any edits to an item will result in a new map being instantiated for this
         * field.
         */
        items: Record<number, number>;
        qp: number;
        /**
         * Any edits to a servant (including bond levels and unlocked costumes) will
         * result in a new array to be instantiated for this field. In addition, the
         * servants that were edited (tracked by `instanceId`) will also be
         * reconstructed.
         */
        servants: Array<MasterServant>;
        soundtracks: ReadonlySet<number>;
    }>;
    updateItem: (itemId: number, quantity: number) => void;
    addServant: (update: MasterServantUpdate) => void;
    updateServants: (instanceIds: Set<number>, update: MasterServantUpdate) => void;
    deleteServants: (instanceIds: Set<number>) => void;
    revertChanges: () => void;
    persistChanges: () => Promise<void>;
}>;

export const getDefaultMasterAccountEditData = () => ({
    bondLevels: {},
    costumes: new Set<number>(),
    items: {},
    qp: 0,
    servants: [],
    soundtracks: new Set<number>()
});

/**
 * Contains a temporary copy of the current master account data for editing.
 */
export const MasterAccountDataContext = createContext<MasterAccountDataContextProps>({
    masterAccountEditData: getDefaultMasterAccountEditData(),
    updateItem: DefaultFunction,
    addServant: DefaultFunction,
    updateServants: DefaultFunction,
    deleteServants: DefaultFunction,
    revertChanges: DefaultFunction,
    persistChanges: async () => {},
});
