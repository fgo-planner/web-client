import { GameServant, GameServantEnhancement, GameServantSkillMaterials, MasterServantAscensionLevel, MasterServantSkillLevel } from '@fgo-planner/types';
import { GameItemConstants } from '../../constants';
import { MapUtils } from '../map.utils';

/**
 * Breakdown of the quantities required for each enhancement category for a
 * single item.
 */
export type MaterialDebt = {
    ascensions: number;
    skills: number;
    appendSkills: number;
    costumes: number;
    total: number;
};

/**
 * Map of items required to enhance a servant to the specified targets. The key
 * is the item's ID, and the value is a breakdown of the quantities required for
 * each enhancement category.
 */
export type MaterialDebtMap = Record<number, MaterialDebt>;

type SkillEnhancements = Readonly<{
    1?: MasterServantSkillLevel;
    2?: MasterServantSkillLevel;
    3?: MasterServantSkillLevel;
}>;

type ServantEnhancements = Readonly<{
    ascension: MasterServantAscensionLevel;
    skills: SkillEnhancements;
    appendSkills: SkillEnhancements;
}>;

export class PlannerComputationUtils {

    private static _DefaultTargetEnhancements: ServantEnhancements = {
        ascension: 4,
        skills: {
            1: 10,
            2: 10,
            3: 10
        },
        appendSkills: {
            1: 10,
            2: 10,
            3: 10
        }
    };

    static addMaterialDebtMap(source: MaterialDebtMap, target: MaterialDebtMap): void {
        for (const [id, debt] of Object.entries(source)) {
            const itemId = Number(id);
            if (!target[itemId]) {
                target[itemId] = { ...debt };
            } else {
                this._addMaterialDebt(debt, target[itemId]);
            }
        }
    }

    static sumMaterialDebtMaps(maps: Array<MaterialDebtMap>): MaterialDebtMap {
        const result: Record<number, MaterialDebt> = {};
        for (const map of maps) {
            this.addMaterialDebtMap(map, result);
        }
        return result;
    }

    static computeMaterialDebtForServant(
        servant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: Array<number>
    ): MaterialDebtMap;

    static computeMaterialDebtForServant(
        servant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: Set<number>,
        targetEnhancements: ServantEnhancements,
        targetCostumes: Set<number>
    ): MaterialDebtMap;

    static computeMaterialDebtForServant(
        servant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: Array<number> | Set<number>,
        targetEnhancements = this._DefaultTargetEnhancements,
        targetCostumes?: Set<number>
    ): MaterialDebtMap {

        if (!(currentCostumes instanceof Set)) {
            currentCostumes = new Set(currentCostumes);
        }

        /**
         * The result map for the servant, instantiated with an entry for QP.
         */
        const result: MaterialDebtMap = {
            [GameItemConstants.QpItemId]: this._instantiateMaterialDebt()
        };

        this._updateResultForSkills(
            result,
            servant.skillMaterials,
            currentEnhancements.skills,
            targetEnhancements.skills,
            'skills'
        );

        this._updateResultForSkills(
            result,
            servant.appendSkillMaterials,
            currentEnhancements.appendSkills,
            targetEnhancements.appendSkills,
            'appendSkills'
        );

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
                this._updateResultForEnhancement(result, ascension, 'ascensions');
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
            this._updateResultForEnhancement(result, costume.materials, 'costumes');
        }

        return result;
    }

    private static _updateResultForSkills(
        result: MaterialDebtMap,
        skillMaterials: Readonly<GameServantSkillMaterials>,
        currentSkills: SkillEnhancements,
        targetSkills: SkillEnhancements,
        skillType: 'skills' | 'appendSkills'
    ): void {

        const currentSkill1 = currentSkills[1] || 0;
        const currentSkill2 = currentSkills[2] || 0;
        const currentSkill3 = currentSkills[3] || 0;

        const targetSkill1 = targetSkills[1] || 0;
        const targetSkill2 = targetSkills[2] || 0;
        const targetSkill3 = targetSkills[3] || 0;

        for (const [key, skill] of Object.entries(skillMaterials)) {
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
            this._updateResultForEnhancement(result, skill, skillType, skillUpgradeCount);
        }
    }

    private static _updateResultForEnhancement(
        result: MaterialDebtMap,
        enhancement: GameServantEnhancement,
        key: keyof MaterialDebt,
        enhancementCount = 1
    ): void {
        /*
         * Update material count.
         */
        for (const { itemId, quantity } of enhancement.materials) {
            const itemCount = MapUtils.getOrDefault(result, itemId, this._instantiateMaterialDebt);
            const total = quantity * enhancementCount;
            itemCount[key] += total;
            itemCount.total += total;
        }
        /*
         * Also update QP count. Assumes that the QP entry is always present in the
         * result map.
         */
        const qpCount = result[GameItemConstants.QpItemId];
        const total = enhancement.qp * enhancementCount;
        qpCount[key] += total;
        qpCount.total += total;
    }

    private static _instantiateMaterialDebt(): MaterialDebt {
        return {
            ascensions: 0,
            skills: 0,
            appendSkills: 0,
            costumes: 0,
            total: 0
        };
    }

    private static _addMaterialDebt(source: MaterialDebt, target: MaterialDebt): void {
        target.ascensions += source.ascensions;
        target.skills += source.skills;
        target.appendSkills += source.appendSkills;
        target.costumes += source.costumes;
        target.total += source.total;
    }

}