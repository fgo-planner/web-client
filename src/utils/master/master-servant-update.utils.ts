import { MasterServant, MasterServantBondLevel } from '@fgo-planner/data-types';
import { GameServantConstants } from '../../constants';
import { MasterServantUpdate, ExistingMasterServantUpdate, MasterServantUpdateIndeterminateValue as IndeterminateValue, NewMasterServantUpdate, ReadonlyRecord, ReadonlyIterable, Immutable, ImmutableArray } from '../../types/internal';
import { MasterServantUtils } from './master-servant.utils';

export class MasterServantUpdateUtils {

    private constructor() {

    }

    //#region Update object instantiation methods

    /**
     * Instantiates a `NewMasterServantUpdate` object for a new servant.
     */
    static instantiateForNewServant(
        bondLevels?: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes?: ReadonlyIterable<number>
    ): NewMasterServantUpdate {

        const gameId = GameServantConstants.DefaultServantId;

        return {
            isNewServant: true,
            gameId,
            summoned: true, // Assume servant has been summoned by player by default
            np: 1,
            level: GameServantConstants.MinLevel,
            ascension: GameServantConstants.MinAscensionLevel,
            skills: {
                1: GameServantConstants.MinSkillLevel,
            },
            appendSkills: {},
            bondLevel: bondLevels?.[gameId],
            unlockedCostumes: new Set(unlockedCostumes)
        };
    }

    //#endregion


    //#region Convert to an update object

    static convertToUpdateObject(
        masterServant: Immutable<MasterServant>,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: ReadonlyIterable<number>
    ): ExistingMasterServantUpdate;

    static convertToUpdateObject(
        masterServants: ImmutableArray<MasterServant>,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: ReadonlyIterable<number>
    ): ExistingMasterServantUpdate;

    static convertToUpdateObject(
        data: ImmutableArray<MasterServant> | Immutable<MasterServant>,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: ReadonlyIterable<number>
    ): ExistingMasterServantUpdate {
        if (Array.isArray(data)) {
            return this._convertToUpdateObjectForMultiple(data, bondLevels, unlockedCostumes);
        }
        return this._convertToUpdateObject(data as Immutable<MasterServant>, bondLevels, unlockedCostumes);
    }

    private static _convertToUpdateObject(
        masterServant: Immutable<MasterServant>,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: ReadonlyIterable<number>
    ): ExistingMasterServantUpdate {

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
            gameId,
            summoned,
            summonDate: (summonDate as Date)?.getTime(),
            np,
            level,
            ascension,
            fouAtk,
            fouHp,
            skills: { ...skills },
            appendSkills: { ...appendSkills },
            bondLevel: bondLevels[masterServant.gameId],
            unlockedCostumes: new Set(unlockedCostumes)
        };
    }

    private static _convertToUpdateObjectForMultiple(
        masterServants: Array<MasterServant>,
        bondLevels: ReadonlyRecord<number, MasterServantBondLevel>,
        unlockedCostumes: ReadonlyIterable<number>
    ): ExistingMasterServantUpdate {

        /*
         * Edge cases
         */
        if (masterServants.length === 0) {
            throw new Error('masterServants array cannot be empty');
        } else if (masterServants.length === 1) {
            return this._convertToUpdateObject(masterServants[0], bondLevels, unlockedCostumes);
        }

        /*
         * Get initial values from the first servant in the array.
         */
        const firstMasterServant = masterServants[0];

        let summonDate = firstMasterServant.summonDate?.getTime() as MasterServantUpdate['summonDate'];

        let {
            summoned,
            np,
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
        } = firstMasterServant as Pick<MasterServantUpdate, 'summoned' | 'np' | 'fouAtk' | 'fouHp' | 'skills' | 'appendSkills'>;
        /*
         * Typecast the `firstMasterServant` to `MasterServantUpdate` in the line above
         * so that the destructured variables inherit the typing for indeterminate
         * values.
         */

        let bondLevel = bondLevels[firstMasterServant.gameId] as MasterServantUpdate['bondLevel'];

        /*
         * Iterate through the rest of the array and update the values as needed.
         */
        for (let i = 1; i < masterServants.length; i++) {
            const masterServant = masterServants[i];
            if (summonDate !== IndeterminateValue && summonDate !== masterServant.summonDate?.getTime()) {
                summonDate = IndeterminateValue;
            }
            if (summoned !== IndeterminateValue && summoned !== masterServant.summoned) {
                summoned = IndeterminateValue;
            }
            if (np !== IndeterminateValue && np !== masterServant.np) {
                np = IndeterminateValue;
            }
            if (fouAtk !== IndeterminateValue && fouAtk !== masterServant.fouAtk) {
                fouAtk = IndeterminateValue;
            }
            if (fouHp !== IndeterminateValue && fouHp !== masterServant.fouHp) {
                fouHp = IndeterminateValue;
            }
            if (skill1 !== IndeterminateValue && skill1 !== masterServant.skills[1]) {
                skill1 = IndeterminateValue;
            }
            if (skill2 !== IndeterminateValue && skill2 !== masterServant.skills[2]) {
                skill2 = IndeterminateValue;
            }
            if (skill3 !== IndeterminateValue && skill3 !== masterServant.skills[3]) {
                skill3 = IndeterminateValue;
            }
            if (appendSkill1 !== IndeterminateValue && appendSkill1 !== masterServant.appendSkills[1]) {
                appendSkill1 = IndeterminateValue;
            }
            if (appendSkill2 !== IndeterminateValue && appendSkill2 !== masterServant.appendSkills[2]) {
                appendSkill2 = IndeterminateValue;
            }
            if (appendSkill3 !== IndeterminateValue && appendSkill3 !== masterServant.appendSkills[3]) {
                appendSkill3 = IndeterminateValue;
            }
            if (bondLevel !== IndeterminateValue && bondLevel !== bondLevels[masterServant.gameId]) {
                bondLevel = IndeterminateValue;
            }
        }

        return {
            isNewServant: false,
            gameId: IndeterminateValue,
            summoned,
            summonDate,
            np,
            level: IndeterminateValue,
            ascension: IndeterminateValue,
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
            },
            bondLevel,
            unlockedCostumes: new Set(unlockedCostumes)
        };
    }

    //#endregion


    //#region Convert to master servant, no target

    /**
     * Converts an update object to a new instance of `MasterServant`. This can be
     * used even if the `isNewServant` property is `false`. Any update fields that
     * contain an indeterminate value will use the default values generated by the
     * `MasterServantUtils.instantiate` method.
     */
    static convertToMasterServant(
        instanceId: number,
        masterServantUpdate: Immutable<MasterServantUpdate>,
        bondLevels: Record<number, MasterServantBondLevel>,
        // unlockedCostumes: Array<number>
    ): MasterServant {
        const masterServant = MasterServantUtils.instantiate(instanceId);
        this._applyFromUpdateObject(masterServant, masterServantUpdate, bondLevels);
        return masterServant;
    }

    //#endregion


    //#region Apply from update object

    static applyFromUpdateObject(
        masterServant: MasterServant,
        masterServantUpdate: Immutable<MasterServantUpdate>,
        bondLevels: Record<number, MasterServantBondLevel>,
        // unlockedCostumes: Array<number>
    ): void;

    static applyFromUpdateObject(
        masterServants: Array<MasterServant>,
        masterServantUpdate: Immutable<MasterServantUpdate>,
        bondLevels: Record<number, MasterServantBondLevel>,
        // unlockedCostumes: Array<number>
    ): void;

    static applyFromUpdateObject(
        target: Array<MasterServant> | MasterServant,
        masterServantUpdate: Immutable<MasterServantUpdate>,
        bondLevels: Record<number, MasterServantBondLevel>,
        // unlockedCostumes: Array<number>
    ): void {
        if (Array.isArray(target)) {
            for (const masterServant of target) {
                this._applyFromUpdateObject(masterServant, masterServantUpdate, bondLevels);
            }
        } else {
            this._applyFromUpdateObject(target, masterServantUpdate, bondLevels);
        }
    }

    private static _applyFromUpdateObject(
        target: MasterServant,
        masterServantUpdate: Immutable<MasterServantUpdate>,
        bondLevels: Record<number, MasterServantBondLevel>,
        // unlockedCostumes: Array<number>
    ): void {

        const {
            isNewServant,
            summoned,
            summonDate,
            np,
            level,
            ascension,
            fouAtk,
            fouHp,
            skills,
            appendSkills,
            bondLevel
        } = masterServantUpdate;

        /*
         * gameId is only present for new servants.
         */
        if (isNewServant) {
            target.gameId = (masterServantUpdate as NewMasterServantUpdate).gameId;
        }
        if (summoned !== IndeterminateValue) {
            target.summoned = summoned;
        }
        if (summonDate !== IndeterminateValue) {
            target.summonDate = summonDate === undefined ? undefined : new Date(summonDate);
        }
        if (np !== IndeterminateValue) {
            target.np = np;
        }
        if (level !== IndeterminateValue) {
            target.level = level;
        }
        if (ascension !== IndeterminateValue) {
            target.ascension = ascension;
        }
        if (fouAtk !== IndeterminateValue) {
            target.fouAtk = fouAtk;
        }
        if (fouHp !== IndeterminateValue) {
            target.fouHp = fouHp;
        }
        if (skills[1] !== IndeterminateValue) {
            target.skills[1] = skills[1];
        }
        if (skills[2] !== IndeterminateValue) {
            target.skills[2] = skills[2];
        }
        if (skills[3] !== IndeterminateValue) {
            target.skills[3] = skills[3];
        }
        if (appendSkills[1] !== IndeterminateValue) {
            target.appendSkills[1] = appendSkills[1];
        }
        if (appendSkills[2] !== IndeterminateValue) {
            target.appendSkills[2] = appendSkills[2];
        }
        if (appendSkills[3] !== IndeterminateValue) {
            target.appendSkills[3] = appendSkills[3];
        }
        if (bondLevel !== IndeterminateValue) {
            if (bondLevel === undefined) {
                delete bondLevels[target.gameId];
            } else {
                bondLevels[target.gameId] = bondLevel;
            }
        }
    }

    //#endregion


    //#region Batch apply from update objects (currently used for data import)

    static batchApplyFromUpdateObjects(
        masterServants: Array<MasterServant>,
        servantUpdates: Array<NewMasterServantUpdate>,
        bondLevels: Record<number, MasterServantBondLevel>,
        // unlockedCostumes: Array<number>
    ): void {
        /*
         * Nothing to do, return.
         */
        if (!servantUpdates.length) {
            return;
        }

        /*
         * No need to do any individual merges, just copy the entire list.
         */
        if (!masterServants.length) {
            /**
             * FIXME This may have issues if the user removes all servants from their roster
             * and re-imports them, since the first `instanceId` will reset to 0.
             */
            let instanceId = 0;
            for (const update of servantUpdates) {
                const masterServant = this.convertToMasterServant(instanceId++, update, bondLevels);
                masterServants.push(masterServant);
            }
            return;
        }

        /**
         * The last `instanceId` of the target list.
         */
        let lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);

        /**
         * A map of the target list where the key is the servant `gameId` and the
         * values are buckets containing the servants with the `gameId`.
         */
        const targetMapByGameId = new Map<number, Array<MasterServant>>();
        for (const targetServant of masterServants) {
            const { gameId } = targetServant;
            let bucket = targetMapByGameId.get(gameId);
            if (!bucket) {
                targetMapByGameId.set(gameId, bucket = []);
            }
            bucket.push(targetServant);
        }

        /**
         * Keeps track of the number of servants by `gameId` have that have been merged
         * into the target list.
         */
        const mergeCountByGameId: Record<number, number> = {};

        /*
         * Iterate through the servantUpdates list.
         */
        for (const update of servantUpdates) {
            const { gameId } = update;
            const mergeCount = mergeCountByGameId[gameId] || 0;
            const bucket = targetMapByGameId.get(gameId);

            /**
             * The target servant to merge into.
             */
            const mergeTarget = bucket?.[mergeCount];

            /*
             * If a suitable merge target could not be found, then just add the servant to
             * the target list. Otherwise, merge the source servant into the target and
             * update the merge count.
             */
            if (!mergeTarget) {
                const servant = this.convertToMasterServant(++lastInstanceId, update, bondLevels);
                masterServants.push(servant);
            } else {
                this.applyFromUpdateObject(mergeTarget, update, bondLevels);
                mergeCountByGameId[gameId] = mergeCount + 1;
            }

        }
    }

    //#endregion

}
