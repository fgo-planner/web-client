import { MasterServantAscensionLevel, MasterServantBondLevel, MasterServantNoblePhantasmLevel, MasterServantSkillLevel } from '@fgo-planner/types';

/**
 * Data transfer object that contains master servant and other related data
 * structured in a way that makes it easier to manipulate.
 *
 * Data conversion between the DTO and `MasterServant` and related data is
 * provided by the `MasterServantEditUtils` class.
 */
export type MasterServantEditData = {

    /**
     * Whether this data represents a new servant that is being added.
     */
    readonly isNewServant: boolean;

    masterServant: {
        /**
         * The ID of the `GameServant` that this servant is an instance of.
         *
         * If multiple servants are being edited, a value of `-1` can be used to
         * represent a indeterminate state.
         */
        gameId: number;
        /**
         * Whether the servant has already been summoned by the master, or is just
         * tentative.
         * 
         * If multiple servants are being edited, a value of `undefined` can be used to
         * represent a indeterminate state.
         */
        summoned?: boolean;
        /**
         * The servant's summoning date in number of milliseconds since the ECMAScript
         * epoch.
         *
         * If multiple servants are being edited, a value of `-1` can be used to
         * represent a indeterminate state.
         */
        summonDate?: number;
        /**
         * The servant's noble phantasm level.
         *
         * If multiple servants are being edited, a value of `-1` can be used to
         * represent a indeterminate state.
         */
        np: MasterServantNoblePhantasmLevel | -1;
        /**
         * The servant's level.
         * 
         * This is currently not supported when multiple servants are being edited. If
         * multiple servants are being edited, this should be set to a value of `-1`.
         * TODO Find a way to handle this when multiple servants are being edited.
         */
        level: number;
        /**
         * The servant's ascension level.
         *
         * This is currently not supported when multiple servants are being edited. If
         * multiple servants are being edited, this should be set to a value of `-1`.
         * TODO Find a way to handle this when multiple servants are being edited.
         */
        ascension: MasterServantAscensionLevel | -1;
        /**
         * The servant's attack fou enhancement.
         *
         * If multiple servants are being edited, a value of `-1` can be used to
         * represent a indeterminate state.
         */
        fouAtk?: number;
        /**
         * The servant's HP fou enhancement.
         * 
         * If multiple servants are being edited, a value of `-1` can be used to
         * represent a indeterminate state.
         */
        fouHp?: number;
        /**
         * The servant's skill levels.
         * 
         * If multiple servants are being edited, a value of `-1` can be used to
         * represent a indeterminate state.
         */
        skills: {
            1: MasterServantSkillLevel | -1;
            2?: MasterServantSkillLevel | -1;
            3?: MasterServantSkillLevel | -1;
        };
        /**
         * The servant's append skill levels.
         * 
         * If multiple servants are being edited, a value of `-1` can be used to
         * represent a indeterminate state.
         */
        appendSkills: {
            1?: MasterServantSkillLevel | -1;
            2?: MasterServantSkillLevel | -1;
            3?: MasterServantSkillLevel | -1;
        };
    }

    /**
     * The servant's bond level.
     *
     * If multiple servants are being edited, a value of `-1` can be used to
     * represent a indeterminate state.
     */
    bondLevel?: MasterServantBondLevel | -1;

    /**
     * Contains all of the IDs of the costumes already unlocked by the master,
     * regardless of which servants are being edited.
     */
    unlockedCostumes: Set<number>;

};
