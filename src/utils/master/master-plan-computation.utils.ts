import { GameServant, GameServantEnhancement, MasterServantAscensionLevel, MasterServantSkillLevel } from '../../types';
import { MapUtils } from '../map.utils';

// TODO Rename this
export type ResultType1 = {
    ascensions: number;
    skills: number;
    costumes: number;
    total: number;
};

type ServantEnhancements = Readonly<{
    ascension: MasterServantAscensionLevel;
    skills: Readonly<{
        1?: MasterServantSkillLevel;
        2?: MasterServantSkillLevel;
        3?: MasterServantSkillLevel;
    }>
}>;

export class MasterPlanComputationUtils {

    private static _DefaultTargetEnhancements: ServantEnhancements = {
        ascension: 4,
        skills: {
            1: 10,
            2: 10,
            3: 10
        }
    };

    static computeMaterialDebtForServant(
        servant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: Array<number>
    ): Record<number, ResultType1>;

    static computeMaterialDebtForServant(
        servant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: Set<number>,
        targetEnhancements: ServantEnhancements,
        targetCostumes: Set<number>
    ): Record<number, ResultType1>;

    static computeMaterialDebtForServant(
        servant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: Array<number> | Set<number>,
        targetEnhancements = this._DefaultTargetEnhancements,
        targetCostumes?: Set<number>
    ): Record<number, ResultType1> {

        if (!(currentCostumes instanceof Set)) {
            currentCostumes = new Set(currentCostumes);
        }

        const stats: Record<number, ResultType1> = {};

        const currentSkill1 = currentEnhancements.skills[1] || 0;
        const currentSkill2 = currentEnhancements.skills[2] || 0;
        const currentSkill3 = currentEnhancements.skills[3] || 0;

        const targetSkill1 = targetEnhancements.skills[1] || 0;
        const targetSkill2 = targetEnhancements.skills[2] || 0;
        const targetSkill3 = targetEnhancements.skills[3] || 0;

        for (const [key, skill] of Object.entries(servant.skillMaterials)) {
            const skillLevel = Number(key);
            /*
             * The number of skills that need to be upgraded to this level. A skill does not
             * need to be upgraded if it is already at least this level, or if this level beyond
             * the targeted level.
             */
            const skillUpgradeCount =
                (currentSkill1 > skillLevel || skillLevel >= targetSkill1 ? 0 : 1) +
                (currentSkill2 > skillLevel || skillLevel >= targetSkill2 ? 0 : 1) +
                (currentSkill3 > skillLevel || skillLevel >= targetSkill3 ? 0 : 1);
            /*
             * Skip if all three skills do not need enhancement at this level.
             */
            if (skillUpgradeCount === 0) {
                continue;
            }
            this._updateResultForEnhancement(stats, skill, 'skills', skillUpgradeCount);
        }

        if (servant.ascensionMaterials) {
            for (const [key, ascension] of Object.entries(servant.ascensionMaterials)) {
                const ascensionLevel = Number(key);
                /*
                 * Skip this ascension servant is already at least this level, or if this level
                 * beyond the targeted level.
                 */
                if (currentEnhancements.ascension >= ascensionLevel || ascensionLevel > targetEnhancements.ascension) {
                    continue;
                }
                this._updateResultForEnhancement(stats, ascension, 'ascensions');
            }
        }

        for (const [key, costume] of Object.entries(servant.costumes)) {
            const costumeId = Number(key);
            /*
             * Skip if the costume is already unlocked, or if it is not targeted.
             */
            if (currentCostumes.has(costumeId) || (targetCostumes && !targetCostumes.has(costumeId))) {
                continue;
            }
            this._updateResultForEnhancement(stats, costume.materials, 'costumes');
        }

        return stats;
    }

    private static _updateResultForEnhancement(
        stats: Record<number, ResultType1>,
        enhancement: GameServantEnhancement,
        key: keyof ResultType1,
        count = 1
    ): void {
        for (const { itemId, quantity } of enhancement.materials) {
            const stat = MapUtils.getOrDefault(stats, itemId, this._instantiateResultType1);
            const total = quantity * count;
            stat[key] += total;
            stat.total += total;
        }
    }

    private static _instantiateResultType1(): ResultType1 {
        return {
            ascensions: 0,
            skills: 0,
            costumes: 0,
            total: 0
        };
    }

}