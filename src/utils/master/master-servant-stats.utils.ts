import { GameServantConstants } from '../../constants';
import { GameServantMap } from '../../services/data/game/game-servant.service';
import { GameServantClass, GameServantRarity, MasterAccount, MasterServant, MasterServantAscensionLevel, MasterServantBondLevel, MasterServantNoblePhantasmLevel } from '../../types';
import { MasterServantSkillLevel } from '../../types/data/master/servant/master-servant-skill-level.type';

export type ServantStatsSet<T> = {
    totalCount: T;
    uniqueCount: T;
    npLevels: { [key in MasterServantNoblePhantasmLevel | 'total']: T };
    averageNpLevel: T;
    ascensionLevels: { [key in MasterServantAscensionLevel]: T };
    averageAscensionLevel: T;
    skillLevels: { [key in MasterServantSkillLevel | 0]: T };
    tripleNinesCount: T;
    tripleTensCount: T;
    averageSkillLevel: T;
    maxHpFouCount: T;
    maxAtkFouCount: T;
    maxGoldHpFouCount: T;
    maxGoldAtkFouCount: T;
    doubleMaxFouCount: T;
    doubleMaxGoldFouCount: T;
    fouValuesCount: T; // For computing the average; undefined values are excluded
    averageFou: T;
    bondLevels: { [key in MasterServantBondLevel]: T };
    bondLevelValuesCount: T; // For computing the average; undefined values are excluded
    averageBondLevel: T;
};

export type ServantStatByRarity = {
    [key in GameServantRarity]: number
} & { overall: number };

type TrackedServantClass =
    GameServantClass.Saber |
    GameServantClass.Archer |
    GameServantClass.Lancer |
    GameServantClass.Rider |
    GameServantClass.Caster |
    GameServantClass.Assassin |
    GameServantClass.Berserker |
    'Extra';

export type ServantStatByClass = {
    [key in TrackedServantClass]: number
} & { overall: number };

export type ServantStatsByRarity = ServantStatsSet<ServantStatByRarity>;

export type ServantStatsByClass = ServantStatsSet<ServantStatByClass>;

export class MasterServantStatsUtils {

    
    //#region Stats by rarity

    static generateStatsByRarity(
        gameServantMap: GameServantMap,
        masterAccount: MasterAccount,
        filter?: string
    ): ServantStatsByRarity {

        const start = window.performance.now();

        const statsByRarity = this._instantiateStatsByRarity();
        if (!masterAccount.servants.length) {
            return statsByRarity;
        }

        const masterServantIds = new Set<number>();
        for (const masterServant of masterAccount.servants) {
            const servantId = masterServant.gameId;
            const servant = gameServantMap[servantId];
            if (!servant) {
                // TODO Log/throw error
                continue;
            }

            let isUnique = false;
            if (!masterServantIds.has(servantId)) {
                masterServantIds.add(servantId);
                isUnique = true;
            }

            this._populateStats(statsByRarity, servant.rarity, masterServant, isUnique);
        }
        this._computeStatAverages(statsByRarity);

        const end = window.performance.now();
        console.log(`Stats by rarity took ${(end - start).toFixed(2)}ms to compute.`);
        console.log(statsByRarity);
        return statsByRarity;
    }

    //#endregion


    //#region Stats by class

    static generateStatsByClass(
        gameServantMap: GameServantMap,
        masterAccount: MasterAccount,
        filter?: string
    ): ServantStatsByClass {

        const start = window.performance.now();

        const statsByClass = this._instantiateStatsByClass();
        if (!masterAccount.servants.length) {
            return statsByClass;
        }

        const masterServantIds = new Set<number>();
        for (const masterServant of masterAccount.servants) {
            const servantId = masterServant.gameId;
            const servant = gameServantMap[servantId];
            if (!servant) {
                // TODO Log/throw error
                continue;
            }

            let isUnique = false;
            if (!masterServantIds.has(servantId)) {
                masterServantIds.add(servantId);
                isUnique = true;
            }

            const trackedClass = this._convertToTrackedClass(servant.class);
            this._populateStats(statsByClass, trackedClass, masterServant, isUnique);
        }
        this._computeStatAverages(statsByClass);

        const end = window.performance.now();
        console.log(`Stats by class took ${(end - start).toFixed(2)}ms to compute.`);
        console.log(statsByClass);
        return statsByClass;
    }

    private static _convertToTrackedClass(servantClass: GameServantClass): TrackedServantClass {
        const isExtraClass =
            servantClass !== GameServantClass.Saber &&
            servantClass !== GameServantClass.Archer &&
            servantClass !== GameServantClass.Lancer &&
            servantClass !== GameServantClass.Rider &&
            servantClass !== GameServantClass.Caster &&
            servantClass !== GameServantClass.Assassin &&
            servantClass !== GameServantClass.Berserker;
        if (isExtraClass) {
            return 'Extra';
        }
        return servantClass as TrackedServantClass;
    }

    //#endregion


    //#region Common data population methods

    private static _populateStats<T extends Record<string, number>>(
        stats: ServantStatsSet<T>,
        statKey: Partial<keyof T>,
        masterServant: MasterServant,
        isUnique: boolean
    ): void {
        
        const { 
            np, 
            ascension, 
            bond,
            fouHp,
            fouAtk,
            skills
        } = masterServant;

        const {
            totalCount,
            uniqueCount,
            npLevels,
            ascensionLevels,
            bondLevelValuesCount,
            bondLevels
        } = stats as ServantStatsSet<Record<string, number>>;

        const key = statKey as string;

        /*
         * Servant count stats
         */
        totalCount[key] += 1;
        totalCount.overall += 1;
        if (isUnique) {
            uniqueCount[key] += 1;
            uniqueCount.overall += 1;
        }

        /*
         * Noble phantasm stats
         */
        npLevels[np][key] += 1;
        npLevels[np].overall += 1;

        npLevels.total[key] += np;
        npLevels.total.overall += np;

        /*
         * Ascension level stats
         */
        ascensionLevels[ascension][key] += 1;
        ascensionLevels[ascension].overall += 1;

        /*
         * Skill level stats
         */
        this._populateSkillStats(stats, key, skills);
        
        /*
         * Fou enhancements stats
         */
        this._populateFouStats(stats, key, fouHp, fouAtk);

        /*
         * Bond level stats.
         *
         * Only counted once for each unique servant. If there are duplicate servants,
         * they should have the same bond level anyways.
         */
        if (bond !== undefined && isUnique) {
            bondLevels[bond][key] += 1;
            bondLevels[bond].overall += 1;
            bondLevelValuesCount[key] += 1;
            bondLevelValuesCount.overall += 1;
        }
    }

    private static _populateSkillStats<T extends Record<string, number>>(
        stats: ServantStatsSet<T>,
        statKey: Partial<keyof T>,
        skills: MasterServant['skills']
    ): void {

        const {
            skillLevels,
            tripleNinesCount,
            tripleTensCount,
        } = stats as ServantStatsSet<Record<string, number>>;

        const key = statKey as string;

        const skill1 = skills[1]; // First skill should always be present.
        const skill2 = skills[2] ?? 0;
        const skill3 = skills[3] ?? 0;

        skillLevels[skill1][key] += 1;
        skillLevels[skill1].overall += 1;

        skillLevels[skill2][key] += 1;
        skillLevels[skill2].overall += 1;

        skillLevels[skill3][key] += 1;
        skillLevels[skill3].overall += 1;

        if (skill1 === 10 && skill2 === 10 && skill3 === 10) {
            tripleTensCount[key] += 1;
            tripleTensCount.overall += 1;
        }
        if (skill1 >= 9 && skill2 >= 9 && skill3 >= 9) {
            tripleNinesCount[key] += 1;
            tripleNinesCount.overall += 1;
        }
    }

    private static _populateFouStats<T extends Record<string, number>>(
        stats: ServantStatsSet<T>,
        statKey: Partial<keyof T>,
        fouHp: number | undefined,
        fouAtk: number | undefined
    ): void {

        const {
            maxHpFouCount,
            maxAtkFouCount,
            maxGoldHpFouCount,
            maxGoldAtkFouCount,
            doubleMaxFouCount,
            doubleMaxGoldFouCount,
            fouValuesCount,
            averageFou
        } = stats as ServantStatsSet<Record<string, number>>;

        const key = statKey as string;

        if (fouHp !== undefined) {
            averageFou[key] += fouHp;
            averageFou.overall += fouHp;
            fouValuesCount[key] += 1;
            fouValuesCount.overall += 1;
            if (fouHp >= 1000) {
                maxHpFouCount[key] += 1;
                maxHpFouCount.overall += 1;
                if (fouHp === 2000) {
                    maxGoldHpFouCount[key] += 1;
                    maxGoldHpFouCount.overall += 1;
                }
            }
        }
        if (fouAtk !== undefined) {
            averageFou[key] += fouAtk;
            averageFou.overall += fouAtk;
            fouValuesCount[key] += 1;
            fouValuesCount.overall += 1;
            if (fouAtk >= 1000) {
                maxAtkFouCount[key] += 1;
                maxAtkFouCount.overall += 1;
                if (fouAtk === 2000) {
                    maxGoldAtkFouCount[key] += 1;
                    maxGoldAtkFouCount.overall += 1;
                }
            }
        }
        if (fouHp !== undefined && fouAtk !== undefined) {
            if (fouHp >= 1000 && fouAtk >= 1000) {
                doubleMaxFouCount[key] += 1;
                doubleMaxFouCount.overall += 1;
                if (fouHp === 2000 && fouAtk === 2000) {
                    doubleMaxGoldFouCount[key] += 1;
                    doubleMaxGoldFouCount.overall += 1;
                }
            }
        }
    }

    private static _computeStatAverages<T extends Record<string, number>>(stats: ServantStatsSet<T>): void {

        const {
            totalCount,
            averageNpLevel, 
            npLevels,
            ascensionLevels,
            averageAscensionLevel,
            skillLevels,
            averageSkillLevel,
            fouValuesCount,
            averageFou,
            bondLevels,
            bondLevelValuesCount,
            averageBondLevel
        } = stats as ServantStatsSet<Record<string, number>>;

        // All the sub-stats should have the same keys.
        const keys = Object.keys(totalCount);

        for (const key of keys) {
            let count = totalCount[key];
            if (count !== 0) {

                /*
                 * Average noble phantasm stats
                 */
                const totalNpLevels = npLevels.total[key];
                averageNpLevel[key] = totalNpLevels / count;

                /*
                 * Average ascension level stats
                 */
                let totalAscensionLevels = 0;
                for (const level of GameServantConstants.AscensionLevels) {
                    if (level === 0) {
                        continue;
                    }
                    totalAscensionLevels += ascensionLevels[level][key] * level;
                }
                averageAscensionLevel[key] = totalAscensionLevels / count;

                /*
                 * Average skill level stats
                 */
                let totalSkillLevels = 0;
                for (const level of GameServantConstants.SkillLevels) {
                    totalSkillLevels += skillLevels[level][key] * level;
                }
                averageSkillLevel[key] = totalSkillLevels / (count * 3);
            }

            /*
             * Average fou enhancement stats
             */
            count = fouValuesCount[key];
            if (count !== 0) {
                averageFou[key] /= count;
            }

            /*
             * Average bond level stats
             */
            count = bondLevelValuesCount[key];
            if (count !== 0) {
                let totalBondLevels = 0;
                for (const level of GameServantConstants.BondLevels) {
                    totalBondLevels += bondLevels[level][key] * level;
                }
                averageBondLevel[key] = totalBondLevels / bondLevelValuesCount[key];
            }
        }

    };

    //#endregion

    
    //#region Data instantiation methods

    private static _instantiateStatsSet<T>(instantiate: () => T): ServantStatsSet<T> {
        return {
            totalCount: instantiate(),
            uniqueCount: instantiate(),
            npLevels: {
                1: instantiate(),
                2: instantiate(),
                3: instantiate(),
                4: instantiate(),
                5: instantiate(),
                total: instantiate()
            },
            averageNpLevel: instantiate(),
            skillLevels: {
                0: instantiate(),
                1: instantiate(),
                2: instantiate(),
                3: instantiate(),
                4: instantiate(),
                5: instantiate(),
                6: instantiate(),
                7: instantiate(),
                8: instantiate(),
                9: instantiate(),
                10: instantiate()
            },
            tripleNinesCount: instantiate(),
            tripleTensCount: instantiate(),
            averageSkillLevel: instantiate(),
            ascensionLevels: {
                0: instantiate(),
                1: instantiate(),
                2: instantiate(),
                3: instantiate(),
                4: instantiate()
            },
            averageAscensionLevel: instantiate(),
            maxHpFouCount: instantiate(),
            maxAtkFouCount: instantiate(),
            maxGoldHpFouCount: instantiate(),
            maxGoldAtkFouCount: instantiate(),
            doubleMaxFouCount: instantiate(),
            doubleMaxGoldFouCount: instantiate(),
            fouValuesCount: instantiate(),
            averageFou: instantiate(),
            bondLevels: {
                0: instantiate(),
                1: instantiate(),
                2: instantiate(),
                3: instantiate(),
                4: instantiate(),
                5: instantiate(),
                6: instantiate(),
                7: instantiate(),
                8: instantiate(),
                9: instantiate(),
                10: instantiate(),
                11: instantiate(),
                12: instantiate(),
                13: instantiate(),
                14: instantiate(),
                15: instantiate()
            },
            bondLevelValuesCount: instantiate(),
            averageBondLevel: instantiate(),
        };
    }

    private static _instantiateStatsByRarity(): ServantStatsByRarity {
        return this._instantiateStatsSet(this._instantiateStatByRarity);
    }

    private static _instantiateStatByRarity(): ServantStatByRarity {
        return {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            overall: 0
        };
    }

    private static _instantiateStatsByClass(): ServantStatsByClass {
        return this._instantiateStatsSet(this._instantiateStatByClass);
    }
    private static _instantiateStatByClass(): ServantStatByClass {
        return {
            [GameServantClass.Saber]: 0,
            [GameServantClass.Archer]: 0,
            [GameServantClass.Lancer]: 0,
            [GameServantClass.Rider]: 0,
            [GameServantClass.Caster]: 0,
            [GameServantClass.Assassin]: 0,
            [GameServantClass.Berserker]: 0,
            'Extra': 0,
            overall: 0
        };
    }

    //#endregion

}
