import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { GameServantConstants } from '../../../../../../constants';
import { ReadonlyRecord } from '../../../../../../types/internal';
import { MasterServantEditData } from './master-servant-edit-data.type';

export class MasterServantEditUtils {

    //#region Instantiate edit data for new master servant

    /**
     * Instantiates edit data for a new master servant entry.
     */
    static instantiateForNewServant(
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: Array<number>
    ): MasterServantEditData {

        const gameId = GameServantConstants.DefaultServantId;

        return {
            isNewServant: true,
            masterServant: {
                gameId,
                summoned: true, // Assume servant has been summoned by player by default
                np: 1,
                level: GameServantConstants.MinLevel,
                ascension: GameServantConstants.MinAscensionLevel,
                skills: {
                    1: GameServantConstants.MinSkillLevel,
                },
                appendSkills: {}
            },
            bondLevel: bondLevels[gameId],
            unlockedCostumes: new Set(unlockedCostumes)
        };
    }

    //#endregion


    //#region Convert to edit data

    static convertToEditData(
        masterServant: MasterServant,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: Array<number>
    ): MasterServantEditData;

    static convertToEditData(
        masterServants: Array<MasterServant>,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: Array<number>
    ): MasterServantEditData;

    static convertToEditData(
        data: Array<MasterServant> | MasterServant,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: Array<number>
    ): MasterServantEditData {
        if (Array.isArray(data)) {
            return this._convertToEditDataMultiple(data, bondLevels, unlockedCostumes);
        }
        return this._convertToEditData(data, bondLevels, unlockedCostumes);
    }

    private static _convertToEditData(
        masterServant: MasterServant,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: Array<number>
    ): MasterServantEditData {

        const {
            gameId,
            summoned,
            summonDate,
            np,
            level,
            ascension,
            fouAtk,
            fouHp,
            skills,
            appendSkills
        } = masterServant;

        return {
            isNewServant: false,
            masterServant: {
                gameId,
                summoned,
                summonDate: summonDate?.getTime(),
                np,
                level,
                ascension,
                fouAtk,
                fouHp,
                skills: { ...skills },
                appendSkills: { ...appendSkills }
            },
            bondLevel: bondLevels[masterServant.gameId],
            unlockedCostumes: new Set(unlockedCostumes)
        };
    }

    private static _convertToEditDataMultiple(
        masterServants: Array<MasterServant>,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: Array<number>
    ): MasterServantEditData {

        /*
         * Edge cases
         */
        if (masterServants.length === 0) {
            throw new Error('masterServants array cannot be empty');
        } else if (masterServants.length === 1) {
            return this._convertToEditData(masterServants[0], bondLevels, unlockedCostumes);
        }

        /*
         * Get initial values from the first servant in the array.
         */
        const firstMasterServant = masterServants[0];

        let summonDate = firstMasterServant.summonDate?.getTime();

        let {
            summoned,
            np,
            fouAtk,
            fouHp
        } = firstMasterServant as MasterServantEditData['masterServant'];

        let {
            1: skill1,
            2: skill2,
            3: skill3
        } = firstMasterServant.skills as MasterServantEditData['masterServant']['skills'];

        let {
            1: appendSkill1,
            2: appendSkill2,
            3: appendSkill3
        } = firstMasterServant.appendSkills as MasterServantEditData['masterServant']['appendSkills'];

        let bondLevel = bondLevels[firstMasterServant.gameId] as MasterServantEditData['bondLevel'];

        /*
         * Iterate through the rest of the array and update the values as needed.
         */
        for (let i = 1; i < masterServants.length; i++) {
            const masterServant = masterServants[i];
            if (summonDate !== -1 && summonDate !== masterServant.summonDate?.getTime()) {
                summonDate = -1;
            }
            if (summoned !== undefined && summoned !== masterServant.summoned) {
                summoned = undefined;
            }
            if (np !== -1 && np !== masterServant.np) {
                np = -1;
            }
            if (fouAtk !== -1 && fouAtk !== masterServant.fouAtk) {
                fouAtk = -1;
            }
            if (fouHp !== -1 && fouHp !== masterServant.fouHp) {
                fouHp = -1;
            }
            if (skill1 !== -1 && skill1 !== masterServant.skills[1]) {
                skill1 = -1;
            }
            if (skill2 !== -1 && skill2 !== masterServant.skills[2]) {
                skill2 = -1;
            }
            if (skill3 !== -1 && skill3 !== masterServant.skills[3]) {
                skill3 = -1;
            }
            if (appendSkill1 !== -1 && appendSkill1 !== masterServant.appendSkills[1]) {
                appendSkill1 = -1;
            }
            if (appendSkill2 !== -1 && appendSkill2 !== masterServant.appendSkills[2]) {
                appendSkill2 = -1;
            }
            if (appendSkill3 !== -1 && appendSkill3 !== masterServant.appendSkills[3]) {
                appendSkill3 = -1;
            }
            if (bondLevel !== -1 && bondLevel !== bondLevels[masterServant.gameId]) {
                bondLevel = -1;
            }
        }

        return {
            isNewServant: false,
            masterServant: {
                gameId: -1,
                summoned,
                summonDate,
                np,
                level: -1,
                ascension: -1,
                fouAtk,
                fouHp,
                skills: {
                    1: skill1,
                    2: skill2,
                    3: skill3
                },
                appendSkills: {
                    1: appendSkill1,
                    2: appendSkill2,
                    3: appendSkill3
                }
            },
            bondLevel,
            unlockedCostumes: new Set(unlockedCostumes)
        };
    }

    //#endregion


    //#region Apply from edit data

    static applyFromEditData(
        masterServantEditData: MasterServantEditData,
        masterServant: MasterServant,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        // unlockedCostumes: Array<number>
    ): void;

    static applyFromEditData(
        masterServantEditData: MasterServantEditData,
        masterServants: Array<MasterServant>,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        // unlockedCostumes: Array<number>
    ): void;

    static applyFromEditData(
        masterServantEditData: MasterServantEditData,
        target: Array<MasterServant> | MasterServant,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        // unlockedCostumes: Array<number>
    ): void {
        if (Array.isArray(target)) {
            for (const masterServant of target) {
                this._applyFromEditData(masterServantEditData, masterServant, bondLevels);
            }
        } else {
            this._applyFromEditData(masterServantEditData, target, bondLevels);
        }
    }

    private static _applyFromEditData(
        masterServantEditData: MasterServantEditData,
        target: MasterServant,
        bondLevels: Record<number, MasterServantBondLevel>,
        // unlockedCostumes: Array<number>
    ): void {

        const {
            isNewServant,
            masterServant: source,
            bondLevel
        } = masterServantEditData;

        const {
            gameId,
            summoned,
            summonDate,
            np,
            level,
            ascension,
            fouAtk,
            fouHp,
            skills,
            appendSkills
        } = source;

        /*
         * gameId is not allowed to be changed for existing servants.
         */
        if (gameId !== -1 && isNewServant) {
            target.gameId = gameId;
        }
        if (summoned !== undefined) {
            target.summoned = summoned;
        }
        if (summonDate !== -1) {
            target.summonDate = summonDate === undefined ? undefined : new Date(summonDate);
        }
        if (np !== -1) {
            target.np = np;
        }
        if (level !== -1) {
            target.level = level;
        }
        if (ascension !== -1) {
            target.ascension = ascension;
        }
        if (fouAtk !== -1) {
            target.fouAtk = fouAtk;
        }
        if (fouHp !== -1) {
            target.fouHp = fouHp;
        }
        if (skills[1] !== -1) {
            target.skills[1] = skills[1];
        }
        if (skills[2] !== -1) {
            target.skills[2] = skills[2];
        }
        if (skills[3] !== -1) {
            target.skills[3] = skills[3];
        }
        if (appendSkills[1] !== -1) {
            target.appendSkills[1] = appendSkills[1];
        }
        if (appendSkills[2] !== -1) {
            target.appendSkills[2] = appendSkills[2];
        }
        if (appendSkills[3] !== -1) {
            target.appendSkills[3] = appendSkills[3];
        }
        if (bondLevel !== -1) {
            if (bondLevel === undefined) {
                delete bondLevels[target.gameId];
            } else {
                bondLevels[target.gameId] = bondLevel;
            }
        }
    }

    //#endregion

}
