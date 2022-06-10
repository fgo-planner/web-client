import { MasterServantAscensionLevel, MasterServantBondLevel, MasterServantNoblePhantasmLevel, MasterServantSkillLevel } from '@fgo-planner/types';

type Indeterminate = 'indeterminate';

export type MasterServantUpdateIndeterminate = Indeterminate;

export const MasterServantUpdateIndeterminateValue: Indeterminate = 'indeterminate';

type MasterServantUpdateBase = {

    /**
     * Whether this data represents a new servant that is being added.
     */
    readonly isNewServant: boolean;

    /**
     * Whether the servant has already been summoned by the master, or is just
     * tentative. Supports indeterminate value.
     */
    summoned: boolean | Indeterminate;

    /**
     * The servant's summoning date in number of milliseconds since the
     * ECMAScript epoch. Supports indeterminate value.
     */
    summonDate?: number | Indeterminate;

    /**
     * The servant's noble phantasm level. Supports indeterminate value.
     */
    np: MasterServantNoblePhantasmLevel | Indeterminate;

    /**
     * The servant's level. Supports indeterminate value.
     *
     * This is currently not supported when multiple servants are being edited.
     * If multiple servants are being edited, this should be set to the
     * indeterminate value.
     *
     * TODO Find a way to handle this when multiple servants are being edited.
     */
    level: number | Indeterminate;

    /**
     * The servant's ascension level. Supports indeterminate value.
     *
     * This is currently not supported when multiple servants are being edited.
     * If multiple servants are being edited, this should be set to the
     * indeterminate value.
     * 
     * TODO Find a way to handle this when multiple servants are being edited.
     */
    ascension: MasterServantAscensionLevel | Indeterminate;

    /**
     * The servant's attack fou enhancement. Supports indeterminate value.
     */
    fouAtk?: number | Indeterminate;

    /**
     * The servant's HP fou enhancement. Supports indeterminate value.
     */
    fouHp?: number | Indeterminate;

    /**
     * The servant's skill levels. Supports indeterminate values.
     */
    skills: {
        1: MasterServantSkillLevel | Indeterminate;
        2?: MasterServantSkillLevel | Indeterminate;
        3?: MasterServantSkillLevel | Indeterminate;
    };

    /**
     * The servant's append skill levels. Supports indeterminate values.
     */
    appendSkills: {
        1?: MasterServantSkillLevel | Indeterminate;
        2?: MasterServantSkillLevel | Indeterminate;
        3?: MasterServantSkillLevel | Indeterminate;
    };

    /**
     * The servant's bond level. Supports indeterminate value.
     */
    bondLevel?: MasterServantBondLevel | Indeterminate;

    /**
     * (optional) Contains all of the IDs of the costumes already unlocked by the
     * master, regardless of which servants are being edited.
     */
    unlockedCostumes?: Set<number>;

};

export type MasterServantUpdateNew = MasterServantUpdateBase & {
    readonly isNewServant: true;
    /**
     * The ID of the servant that is being added.
     */
    gameId: number;
};

export type MasterServantUpdateExisting = MasterServantUpdateBase & {
    readonly isNewServant: false;
    /**
     * The ID of the servant that is being added. Supports indeterminate value when
     * updating existing servants.
     */
    gameId: number | Indeterminate
};

/**
 * Data transfer object for updating master servant data. Some fields can be set
 * to an indeterminate value (specific value depends on the field) when updating
 * multiple servants or when performing partial updates. Fields set to an
 * indeterminate value will be ignored when updating the master servant data.
 *
 * Data conversion between the update payload and master servant (and related
 * data) is handled by the `MasterServantUpdateUtils` class. 
 */
export type MasterServantUpdate = MasterServantUpdateNew | MasterServantUpdateExisting;
