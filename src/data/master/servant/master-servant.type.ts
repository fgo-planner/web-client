import { MasterServantAscensionLevel } from './master-servant-ascension-level.type';
import { MasterServantBondLevel } from './master-servant-bond-level.type';
import { MasterServantNoblePhantasmLevel } from './master-servant-noble-phantasm-level.type';

/**
 * Represents an instance of a servant that is owned by a master.
 */
export type MasterServant = {

    instanceId: number;

    gameId: number;
    
    dateAcquired?: Date;

    level: number;

    ascensionLevel: MasterServantAscensionLevel;

    bond?: MasterServantBondLevel;

    fouAtk?: number;

    fouHp?: number;

    skillLevels: {

        1: number;

        2?: number;

        3?: number;

    };

    noblePhantasmLevel: MasterServantNoblePhantasmLevel;

};
