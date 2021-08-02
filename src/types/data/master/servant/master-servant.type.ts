import { MasterServantAscensionLevel } from './master-servant-ascension-level.type';
import { MasterServantNoblePhantasmLevel } from './master-servant-noble-phantasm-level.type';
import { MasterServantSkillLevel } from './master-servant-skill-level.type';

/**
 * Represents an instance of a servant that is owned by a master.
 */
export type MasterServant = {

    instanceId: number;

    gameId: number;

    np: MasterServantNoblePhantasmLevel;

    level: number;

    ascension: MasterServantAscensionLevel;

    fouHp?: number;

    fouAtk?: number;

    skills: {

        1: MasterServantSkillLevel;

        2?: MasterServantSkillLevel;

        3?: MasterServantSkillLevel;

    };

    appendSkills: {

        1?: MasterServantSkillLevel;

        2?: MasterServantSkillLevel;

        3?: MasterServantSkillLevel;

    };

    acquired?: Date;

};
