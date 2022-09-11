import { Immutable, Nullable } from '@fgo-planner/common-core';
import { GameServant, GameServantClass, MasterServantConstants, GameServantRarity, MasterAccount, MasterServant, MasterServantAscensionLevel, MasterServantBondLevel, MasterServantNoblePhantasmLevel, MasterServantSkillLevel } from '@fgo-planner/data-core';
import { GameServantClassSimplified, GameServantMap } from '../../../../types/data';
import { GameServantUtils } from '../../../../utils/game/game-servant.utils';

type MasterServantStatGroupedByRarity = {
    [key in GameServantRarity]: number
} & { overall: number };

type MasterServantStatGroupedByClass = {
    [key in GameServantClassSimplified]: number
} & { overall: number };

export type MasterServantStats<T> = {
    totalCount: T;
    uniqueCount: T;
    npLevels: Record<MasterServantNoblePhantasmLevel | 'total', T>;
    averageNpLevel: T;
    ascensionLevels: Record<MasterServantAscensionLevel, T>;
    averageAscensionLevel: T;
    skillLevels: Record<MasterServantSkillLevel | 0, T>;
    tripleNineSkillsCount: T;
    tripleTenSkillsCount: T;
    averageSkillLevel: T;
    appendSkillLevels: Record<MasterServantSkillLevel | 0, T>;
    tripleNineAppendSkillsCount: T;
    tripleTenAppendSkillsCount: T;
    averageAppendSkillLevel: T;
    maxHpFouCount: T;
    maxAtkFouCount: T;
    maxGoldHpFouCount: T;
    maxGoldAtkFouCount: T;
    doubleMaxFouCount: T;
    doubleMaxGoldFouCount: T;
    fouValuesCount: T; // For computing the average; undefined values are excluded
    averageFou: T;
    bondLevels: Record<MasterServantBondLevel, T>;
    bondLevelValuesCount: T; // For computing the average; undefined values are excluded
    averageBondLevel: T;
};

export type MasterServantStatsGroupedByRarity = MasterServantStats<MasterServantStatGroupedByRarity>;

export type MasterServantStatsGroupedByClass = MasterServantStats<MasterServantStatGroupedByClass>;

export type MasterServantStatsGroupBy = 'rarity' | 'class';

export type MasterServantStatsFilterOptions = {
    classes: Set<GameServantClassSimplified>;
    rarities: Set<GameServantRarity>;
};

export class MasterServantStatsUtils {

    private constructor () {
        
    }

    //#region Stats by rarity

    static generateStatsGroupedByRarity(
        gameServantMap: GameServantMap,
        masterAccount: MasterAccount,
        filter: MasterServantStatsFilterOptions
    ): MasterServantStatsGroupedByRarity {
        const start = window.performance.now();

        const statsByRarity = this._instantiateStatsGroupedByRarity();
        if (!masterAccount.servants.length) {
            return statsByRarity;
        }

        const masterServantIds = new Set<number>();
        for (const masterServant of masterAccount.servants) {
            /*
             * Skip servant if it is not summoned.
             */
            if (!masterServant.summoned) {
                continue;
            }

            const servantId = masterServant.gameId;
            const servant = gameServantMap[servantId];
            if (!servant) {
                // TODO Log/throw error
                continue;
            }

            const { rarities, ..._filter } = filter;
            if (!this._isServantEligible(servant, _filter)) {
                continue;
            }

            let isUnique = false;
            if (!masterServantIds.has(servantId)) {
                masterServantIds.add(servantId);
                isUnique = true;
            }

            this._populateStats(statsByRarity, servant.rarity, masterServant, masterAccount.bondLevels, isUnique);
        }
        this._computeStatAverages(statsByRarity);

        const end = window.performance.now();
        console.log(`Stats by rarity took ${(end - start).toFixed(2)}ms to compute.`);
        console.log(statsByRarity);
        return statsByRarity;
    }

    //#endregion


    //#region Stats by class

    static generateStatsGroupedByClass(
        gameServantMap: GameServantMap,
        masterAccount: MasterAccount,
        filter: MasterServantStatsFilterOptions
    ): MasterServantStatsGroupedByClass {

        const start = window.performance.now();

        const statsByClass = this._instantiateStatsGroupedByClass();
        if (!masterAccount.servants.length) {
            return statsByClass;
        }

        const masterServantIds = new Set<number>();
        for (const masterServant of masterAccount.servants) {
            /*
             * Skip servant if it is not summoned.
             */
            if (!masterServant.summoned) {
                continue;
            }
            
            const servantId = masterServant.gameId;
            const servant = gameServantMap[servantId];
            if (!servant) {
                // TODO Log/throw error
                continue;
            }

            const { classes, ..._filter } = filter;
            if (!this._isServantEligible(servant, _filter)) {
                continue;
            }

            let isUnique = false;
            if (!masterServantIds.has(servantId)) {
                masterServantIds.add(servantId);
                isUnique = true;
            }

            const simplifiedClass = GameServantUtils.convertToSimplifiedClass(servant.class);
            this._populateStats(statsByClass, simplifiedClass, masterServant, masterAccount.bondLevels, isUnique);
        }
        this._computeStatAverages(statsByClass);

        const end = window.performance.now();
        console.log(`Stats by class took ${(end - start).toFixed(2)}ms to compute.`);
        console.log(statsByClass);
        return statsByClass;
    }

    //#endregion


    //#region Common data population methods

    private static _isServantEligible(
        servant: Immutable<GameServant>,
        filter: Partial<MasterServantStatsFilterOptions>
    ): boolean {

        if (filter.classes) {
            const simplifiedClass = GameServantUtils.convertToSimplifiedClass(servant.class);
            if (!filter.classes.has(simplifiedClass)) {
                return false;
            }
        }

        if (filter.rarities && !filter.rarities.has(servant.rarity)) {
            return false;
        }

        return true;
    }

    private static _populateStats<T extends Record<string, number>>(
        stats: MasterServantStats<T>,
        statKey: Partial<keyof T>,
        masterServant: MasterServant,
        bondLevelMap: Record<number, MasterServantBondLevel>,
        isUnique: boolean
    ): void {

        const {
            np,
            ascension,
            fouHp,
            fouAtk,
            skills,
            appendSkills
        } = masterServant;

        const {
            totalCount,
            uniqueCount,
            npLevels,
            ascensionLevels,
            skillLevels,
            tripleNineSkillsCount,
            tripleTenSkillsCount,
            appendSkillLevels,
            tripleNineAppendSkillsCount,
            tripleTenAppendSkillsCount
        } = stats as MasterServantStats<Record<string, number>>;

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
        this._populateSkillStats(skillLevels, tripleNineSkillsCount, tripleTenSkillsCount, key, skills);

        /*
         * Append skill level stats
         */
        this._populateSkillStats(appendSkillLevels, tripleNineAppendSkillsCount, tripleTenAppendSkillsCount, key, appendSkills);

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
        if (isUnique) {
            this._populateBondStats(stats, key, bondLevelMap[masterServant.gameId]);
        }

    }

    private static _populateSkillStats<T extends Record<string, number>>(
        skillLevels: MasterServantStats<Record<string, number>>['skillLevels'],
        tripleNineSkillsCount: Record<string, number>,
        tripleTenSkillsCount: Record<string, number>,
        statKey: Partial<keyof T>,
        skills: MasterServant['appendSkills']
    ): void {

        const key = statKey as string;

        const skill1 = skills[1] ?? 0;
        const skill2 = skills[2] ?? 0;
        const skill3 = skills[3] ?? 0;

        skillLevels[skill1][key] += 1;
        skillLevels[skill1].overall += 1;

        skillLevels[skill2][key] += 1;
        skillLevels[skill2].overall += 1;

        skillLevels[skill3][key] += 1;
        skillLevels[skill3].overall += 1;

        if (skill1 === 10 && skill2 === 10 && skill3 === 10) {
            tripleTenSkillsCount[key] += 1;
            tripleTenSkillsCount.overall += 1;
        }
        if (skill1 >= 9 && skill2 >= 9 && skill3 >= 9) {
            tripleNineSkillsCount[key] += 1;
            tripleNineSkillsCount.overall += 1;
        }
    }

    private static _populateFouStats<T extends Record<string, number>>(
        stats: MasterServantStats<T>,
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
        } = stats as MasterServantStats<Record<string, number>>;

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

    private static _populateBondStats<T extends Record<string, number>>(
        stats: MasterServantStats<T>,
        statKey: string,
        bond: Nullable<MasterServantBondLevel>
    ): void {

        if (bond == null) {
            return;
        }

        const {
            bondLevelValuesCount,
            bondLevels
        } = stats as MasterServantStats<Record<string, number>>;

        bondLevels[bond][statKey] += 1;
        bondLevels[bond].overall += 1;
        bondLevelValuesCount[statKey] += 1;
        bondLevelValuesCount.overall += 1;
    }

    private static _computeStatAverages<T extends Record<string, number>>(stats: MasterServantStats<T>): void {

        const {
            totalCount,
            averageNpLevel,
            npLevels,
            ascensionLevels,
            averageAscensionLevel,
            skillLevels,
            averageSkillLevel,
            appendSkillLevels,
            averageAppendSkillLevel,
            fouValuesCount,
            averageFou,
            bondLevels,
            bondLevelValuesCount,
            averageBondLevel
        } = stats as MasterServantStats<Record<string, number>>;

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
                for (const level of MasterServantConstants.AscensionLevels) {
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
                for (const level of MasterServantConstants.SkillLevels) {
                    totalSkillLevels += skillLevels[level][key] * level;
                }
                averageSkillLevel[key] = totalSkillLevels / (count * 3);

                /*
                * Average skill level stats
                */
                let totalAppendSkillLevels = 0;
                for (const level of MasterServantConstants.SkillLevels) {
                    totalAppendSkillLevels += appendSkillLevels[level][key] * level;
                }
                averageAppendSkillLevel[key] = totalAppendSkillLevels / (count * 3);
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
                for (const level of MasterServantConstants.BondLevels) {
                    totalBondLevels += bondLevels[level][key] * level;
                }
                averageBondLevel[key] = totalBondLevels / bondLevelValuesCount[key];
            }
        }

    };

    //#endregion


    //#region Data instantiation methods

    private static _instantiateStatsSet<T>(instantiate: () => T): MasterServantStats<T> {
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
            tripleNineSkillsCount: instantiate(),
            tripleTenSkillsCount: instantiate(),
            averageSkillLevel: instantiate(),
            appendSkillLevels: {
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
            tripleNineAppendSkillsCount: instantiate(),
            tripleTenAppendSkillsCount: instantiate(),
            averageAppendSkillLevel: instantiate(),
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

    private static _instantiateStatsGroupedByRarity(): MasterServantStatsGroupedByRarity {
        return this._instantiateStatsSet(this._instantiateStatByRarity);
    }

    private static _instantiateStatByRarity(): MasterServantStatGroupedByRarity {
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

    private static _instantiateStatsGroupedByClass(): MasterServantStatsGroupedByClass {
        return this._instantiateStatsSet(this._instantiateStatByClass);
    }
    private static _instantiateStatByClass(): MasterServantStatGroupedByClass {
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
