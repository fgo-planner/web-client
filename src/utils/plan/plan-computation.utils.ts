import { GameServant, GameServantEnhancement, GameServantSkillMaterials, MasterServantAscensionLevel, MasterServantSkillLevel } from '@fgo-planner/types';
import { GameItemConstants, GameServantConstants } from '../../constants';
import { MapUtils } from '../map.utils';

export type ComputationOptions = {
    include: {
        ascensions?: boolean;
        skills?: boolean;
        appendSkills?: boolean;
        costumes?: boolean;
    };
    exclude?: {
        lores?: boolean;
    }
};

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

export class PlanComputationUtils {

    private static get _defaultOptions(): ComputationOptions {
        return {
            include: {
                ascensions: true,
                skills: true,
                appendSkills: true,
                costumes: true
            }
        };
    }

    private static get _defaultTargetEnhancements(): ServantEnhancements {
        return {
            ascension: GameServantConstants.MaxAscensionLevel,
            skills: {
                1: GameServantConstants.MaxSkillLevel,
                2: GameServantConstants.MaxSkillLevel,
                3: GameServantConstants.MaxSkillLevel
            },
            appendSkills: {
                1: GameServantConstants.MaxSkillLevel,
                2: GameServantConstants.MaxSkillLevel,
                3: GameServantConstants.MaxSkillLevel,
            }
        };
    }

    /**
     * Adds the values from a `MaterialDebtMap` to another `MaterialDebtMap`. Only
     * the the target map will be updated; the values of the source map will not be
     * changed.
     */
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

    /**
     * Takes an array of `MaterialDebtMap` and returns a new `MaterialDebtMap`
     * containing the sum of the values of all the maps.
     */
    static sumMaterialDebtMaps(maps: Array<MaterialDebtMap>): MaterialDebtMap {
        const result: Record<number, MaterialDebt> = {};
        for (const map of maps) {
            this.addMaterialDebtMap(map, result);
        }
        return result;
    }

    //#region computeMaterialDebtForServant + helper methods

    static computeMaterialDebtForServant(
        servant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: Array<number> | Set<number>,
        options?: ComputationOptions
    ): MaterialDebtMap;

    static computeMaterialDebtForServant(
        servant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: Array<number> | Set<number>,
        targetEnhancements: ServantEnhancements,
        targetCostumes: Set<number>,
        options?: ComputationOptions
    ): MaterialDebtMap;

    static computeMaterialDebtForServant(
        servant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: Array<number> | Set<number>,
        param4?: ServantEnhancements | ComputationOptions,
        param5?: Set<number>,
        param6?: ComputationOptions
    ): MaterialDebtMap {
        let targetEnhancements: ServantEnhancements;
        let targetCostumes = undefined;
        let options = undefined;
        if (param4 === undefined || (param4 as any)['include']) {
            targetEnhancements = this._defaultTargetEnhancements;
            options = param4 as ComputationOptions | undefined;
        } else {
            targetEnhancements = param4 as ServantEnhancements;
            targetCostumes = param5 as Set<number> | undefined;
            options = param6;
        }
        return this._computeMaterialDebtForServant(
            servant,
            currentEnhancements,
            currentCostumes,
            targetEnhancements,
            targetCostumes,
            options
        );
    }

    private static _computeMaterialDebtForServant(
        servant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: Array<number> | Set<number>,
        targetEnhancements: ServantEnhancements,
        targetCostumes?: Set<number>,
        options = this._defaultOptions
    ): MaterialDebtMap {

        const { include, exclude } = options;

        if (Array.isArray(currentCostumes)) {
            currentCostumes = new Set(currentCostumes);
        }

        /**
         * The result map for the servant, instantiated with an entry for QP.
         */
        const result: MaterialDebtMap = {
            [GameItemConstants.QpItemId]: this._instantiateMaterialDebt()
        };

        if (include.skills) {
            this._updateResultForSkills(
                result,
                servant.skillMaterials,
                currentEnhancements.skills,
                targetEnhancements.skills,
                'skills',
                exclude?.lores
            );
        }

        if (include.appendSkills) {
            this._updateResultForSkills(
                result,
                servant.appendSkillMaterials,
                currentEnhancements.appendSkills,
                targetEnhancements.appendSkills,
                'appendSkills',
                exclude?.lores
            );
        }

        if (include.ascensions) {
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
        }

        if (include.costumes) {
            for (const [key, costume] of Object.entries(servant.costumes)) {
                const costumeId = Number(key);
                /*
                 * Skip if the costume is already unlocked, or if it is not targeted. If the
                 * targetCostumes set is undefined, then all costumes are target by default.
                 */
                if (currentCostumes.has(costumeId) || (targetCostumes && !targetCostumes.has(costumeId))) {
                    continue;
                }
                this._updateResultForEnhancement(result, costume.materials, 'costumes');
            }
        }

        return result;
    }

    private static _updateResultForSkills(
        result: MaterialDebtMap,
        skillMaterials: Readonly<GameServantSkillMaterials>,
        currentSkills: SkillEnhancements,
        targetSkills: SkillEnhancements,
        skillType: 'skills' | 'appendSkills',
        excludeLores?: boolean
    ): void {

        const currentSkill1 = currentSkills[1] || 0;
        const currentSkill2 = currentSkills[2] || 0;
        const currentSkill3 = currentSkills[3] || 0;

        const targetSkill1 = targetSkills[1] || 0;
        const targetSkill2 = targetSkills[2] || 0;
        const targetSkill3 = targetSkills[3] || 0;

        for (const [key, skill] of Object.entries(skillMaterials)) {
            const skillLevel = Number(key);
            if (excludeLores && skillLevel === (GameServantConstants.MaxSkillLevel - 1)) {
                continue;
            }
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

    //#endregion


    //#region Other helper methods

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

    //#endregion

}