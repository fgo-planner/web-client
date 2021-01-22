/**
 * Represents an instance of a servant that is owned by a master.
 */
export type MasterServant = {

    instanceId: number;

    gameId: number;
    
    dateAcquired?: Date;

    level: number;

    ascensionLevel: number;

    bond?: number;

    fouAtk?: number;

    fouHp?: number;

    skillLevels: {

        1?: number;

        2?: number;

        3?: number;

    };

    noblePhantasmLevel: number;

}
