import { MasterServantAscensionLevel } from './master-servant-ascension-level.type';
import { MasterServantBondLevel } from './master-servant-bond-level.type';
import { MasterServantSkillLevel } from './master-servant-skill-level.type';
import { MasterServantNoblePhantasmLevel } from './master-servant-noble-phantasm-level.type';

/**
 * Represents an instance of a servant that is owned by a master.
 */
export type MasterServant = {

    instanceId: number;

    gameId: number;

    np: MasterServantNoblePhantasmLevel;

    level: number;

    ascension: MasterServantAscensionLevel;

    bond?: MasterServantBondLevel;

    fouHp?: number;

    fouAtk?: number;

    skills: {

        1: MasterServantSkillLevel;

        2?: MasterServantSkillLevel;

        3?: MasterServantSkillLevel;

    };

    costumes?: number[];

    acquired?: Date;

};
