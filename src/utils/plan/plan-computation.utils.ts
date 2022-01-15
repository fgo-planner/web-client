import { GameServant, GameServantEnhancement, GameServantSkillMaterials, MasterAccount, MasterServant, MasterServantAscensionLevel, MasterServantSkillLevel, Plan, PlanServant, PlanServantEnhancements, PlanServantOwned, PlanServantType } from '@fgo-planner/types';
import { GameItemConstants, GameServantConstants } from '../../constants';
import { GameServantMap, ReadonlyRecord } from '../../types/internal';
import { ArrayUtils } from '../array.utils';
import { ObjectUtils } from '../object.utils';
import { PlanServantUtils } from './plan-servant.utils';

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

export type PlanServantDebt = {
    type: PlanServantType;
    gameId: number;
    instanceId?: number;
    /**
     * Effective current skills. This may differ actual current skills set by the
     * user. Computed based on master servant data and/or previous plans in the
     * group.
     */
    current: PlanServantEnhancements;
    /**
     * Effective target skills. This may differ actual current skills set by the
     * user. Computed based on master servant data and/or previous plans in the
     * group.
     */
    target: PlanServantEnhancements;
    materialDebt: MaterialDebtMap;
};

/**
 * Computed material debt for the target plan. Also includes summarized data for
 * any preceding plans from the same group, if applicable.
 */
export type PlanDebt = {
    /**
     * Detailed material debt for the servants in the target plan.
     */
    servants: {
        [PlanServantType.Owned]: Record<number, PlanServantDebt>;
        [PlanServantType.Unowned]: Record<number, PlanServantDebt>;
    }
    /**
     * Summarized material debt for the target plan.
     */
    planTotal: MaterialDebtMap;
    /**
     * Summarized material debt for other plans that precede the target plan in
     * the plan group. Does not include the target plan or any proceeding plans.
     * 
     * This is a map where the key is the `_id` field of the plan, and the value
     * is the material debt total for the plan.
     */
    previousPlans: Record<string, MaterialDebtMap>;
    /**
     * Summarized material debt for all the preceding plans and the target plan.
     * Does not any proceeding plans.
     */
    groupTotal: MaterialDebtMap;
    /**
     * Map of item quantities needed based on master's current inventory.
     */
    itemDebt: Record<number, number>; // TODO Is this needed here?
};

type SkillEnhancements = Readonly<{
    1?: MasterServantSkillLevel;
    2?: MasterServantSkillLevel;
    3?: MasterServantSkillLevel;
}>;

type ServantEnhancements = Readonly<{
    ascension?: MasterServantAscensionLevel;
    skills: SkillEnhancements;
    appendSkills: SkillEnhancements;
}>;

/**
 * Simplified version of `MasterAccount` for internal use.
 */
type MasterAccountData = Readonly<{
    /**
     * Item quantities held by the master account, including QP, mapped by the
     * items' `itemId` value.
     */
    items: ReadonlyRecord<number, number>;
    /**
     * Servants owned by the master account, mapped by the servants' `instanceId`
     * value.
     */
    servants: ReadonlyRecord<number, Readonly<MasterServant>>;
    costumes: ReadonlySet<number>;
}>;

export class PlanComputationUtils {

    private static get _defaultOptions(): Readonly<ComputationOptions> {
        return {
            include: {
                ascensions: true,
                skills: true,
                appendSkills: true,
                costumes: true
            }
        };
    };

    private static get _defaultTargetEnhancements(): Readonly<ServantEnhancements> {
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
    };

    /**
     * Adds the values from a `MaterialDebtMap` to another `MaterialDebtMap`. Only
     * the the target map will be updated; the values of the source map will not be
     * changed.
     */
    static addMaterialDebtMap(target: MaterialDebtMap, source: MaterialDebtMap): void {
        for (const [id, debt] of Object.entries(source)) {
            const itemId = Number(id);
            if (!target[itemId]) {
                target[itemId] = { ...debt };
            } else {
                this._addMaterialDebt(target[itemId], debt);
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
            this.addMaterialDebtMap(result, map);
        }
        return result;
    }

    /**
     * Returns the `instanceId` for owned servants, or `gameId` for unowned
     * servants.
     */
    static getKeyForPlanServant(planServant: PlanServant): number {
        const { type } = planServant;
        if (type === PlanServantType.Owned) {
            return (planServant as PlanServantOwned).instanceId;
        } else {
            return planServant.gameId;
        }
    }

    //#region computeMaterialDebtForPlans + helper methods

    /**
     * Computes the material debt for the given plan, and optionally the other plans
     * from the plan group, if any.
     *
     * @param gameServantMap Game servant map data.
     * @param masterAccount Master account data.
     * @param targetPlan The target plan.
     * @param previousPlans (optional) Any preceding plans from the plan group,
     * relative to the target plan. This should exclude the target plan and any
     * proceeding plans.
     */
    static computeMaterialDebtForPlans(
        gameServantMap: GameServantMap,
        masterAccount: Readonly<MasterAccount>,
        targetPlan: Readonly<Plan>,
        previousPlans?: ReadonlyArray<Plan>,
        optionsOverride?: ComputationOptions
    ): PlanDebt {

        const start = window.performance.now();

        /**
         * The computation result. This will be updated as each plan is computed.
         */
        const result = this._instantiatePlanDebt();

        /**
         * Pre-processed master account data.
         */
        const masterAccountData = this._preProcessMasterAccount(masterAccount);

        /**
         * The computation options. If options override was not given, then use options
         * from target plan.
         */
        const options = optionsOverride || this._parseComputationOptionsFromPlan(targetPlan);

        /*
         * Run computations for previous plans in the group first.
         */
        previousPlans?.forEach(plan => {
            this._computeMaterialDebtForPlan(
                result,
                gameServantMap,
                masterAccountData,
                plan,
                options
            );
        });
        /*
         * Finally, run computations for the target plan.
         */
        this._computeMaterialDebtForPlan(
            result,
            gameServantMap,
            masterAccountData,
            targetPlan,
            options,
            true
        );

        const end = window.performance.now();
        console.log(`Plan debt took ${(end - start).toFixed(2)}ms to compute.`);
        console.log(result);
        return result;
    }

    private static _computeMaterialDebtForPlan(
        result: PlanDebt,
        gameServantMap: GameServantMap,
        masterAccountData: MasterAccountData,
        plan: Readonly<Plan>,
        options: ComputationOptions,
        isTargetPlan = false
    ): void {

        for (const planServant of plan.servants) {
            /*
             * Skip the servant if it is not enabled.
             */
            if (!planServant.enabled.servant) {
                continue;
            }
            /*
             * Retrieve the game servant data from the map.
             */
            const gameServant = gameServantMap[planServant.gameId];
            if (!gameServant) {
                continue;
            }
            /*
             * Compute the options based on a merge of the plan and servant options.
             */
            const servantOptions = this._parseComputationOptionsFromPlanServant(planServant);
            options = this._mergeComputationOptions(options, servantOptions);
            /*
             * Compute the debt for the servant for the current plan.
             */
            const servantComputationResult = this._computeMaterialDebtForPlanServant(
                result,
                gameServant,
                planServant,
                masterAccountData,
                options
            );

            if (!servantComputationResult) {
                continue;
            }

            const [planServantDebt, materialDebtMap] = servantComputationResult;
            /*
             * Update the result with the computed data.
             */
            let planDebtMap: MaterialDebtMap;
            if (isTargetPlan) {
                Object.assign(planServantDebt.materialDebt, materialDebtMap);
                planDebtMap = result.planTotal;
            } else {
                planDebtMap = ObjectUtils.getOrDefault(result.previousPlans, plan._id, this._instantiateMaterialDebt);
            }
            this.addMaterialDebtMap(planDebtMap, materialDebtMap);
            this.addMaterialDebtMap(result.groupTotal, materialDebtMap);
        }

        // TODO Compute the grand total in the `result.itemDebt`;
    }

    private static _computeMaterialDebtForPlanServant(
        result: PlanDebt,
        gameServant: Readonly<GameServant>,
        planServant: Readonly<PlanServant>,
        masterAccountData: MasterAccountData,
        options: ComputationOptions
    ): [PlanServantDebt, MaterialDebtMap] | undefined {

        /**
         * This is the `instanceId` for owned servants, or `gameId` for unowned
         * servants.
         */
        const key = this.getKeyForPlanServant(planServant);

        const resultServants = result.servants[planServant.type];

        let planServantDebt = resultServants[key];
        if (!planServantDebt) {
            /*
             * If the plan servant does not yet exist in the result, then instantiate it and
             * add it to the result.
             */
            planServantDebt = this._instantiatePlanServantDebt(planServant);
            resultServants[key] = planServantDebt;
            /*
             * If it is an owned servant, make sure that the current enhancement values
             * match those from the master servant.
             */
            if (planServant.type === PlanServantType.Owned) {
                const masterServant = masterAccountData.servants[key];
                if (!masterServant) {
                    // TODO Log warning to console
                    return undefined;
                }
                PlanServantUtils.updateEnhancements(planServantDebt.current, masterServant);
            }
        } else {
            /*
             * If the plan servant was already in the result, then it was from a previous
             * plan in the group. This means the for the current plan, the previous target
             * enhancements should be the new current, and the target values from the plan
             * should be the new target.
             */
            PlanServantUtils.updateEnhancements(planServantDebt.current, planServantDebt.target);
            PlanServantUtils.updateEnhancements(planServantDebt.target, planServant.target);
        }

        const { current, target } = planServantDebt;

        const materialDebtMap = this._computeMaterialDebtForServant(
            gameServant,
            current,
            current.costumes,
            target,
            target.costumes,
            options
        );

        return [planServantDebt, materialDebtMap];
    }

    private static _preProcessMasterAccount(masterAccount: Readonly<MasterAccount>): MasterAccountData {
        const servants = ArrayUtils.mapArrayToObject(masterAccount.servants, servant => servant.instanceId);

        const items = ArrayUtils.mapArrayToObject(masterAccount.items, item => item.itemId, item => item.quantity);
        items[GameItemConstants.QpItemId] = masterAccount.qp; // Add QP quantity to the map.

        const costumes = new Set(masterAccount.costumes);

        return { servants, items, costumes };
    }

    //#endregion


    //#region computeMaterialDebtForServant + helper methods

    static computeMaterialDebtForServant(
        gameServant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: ReadonlyArray<number>,
        options?: ComputationOptions
    ): MaterialDebtMap;

    static computeMaterialDebtForServant(
        gameServant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: ReadonlyArray<number>,
        targetEnhancements: ServantEnhancements,
        targetCostumes: ReadonlyArray<number>,
        options?: ComputationOptions
    ): MaterialDebtMap;

    /**
     * Method implementation
     */
    static computeMaterialDebtForServant(
        gameServant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: ReadonlyArray<number>,
        param4?: ServantEnhancements | ComputationOptions,
        param5?: ReadonlyArray<number>,
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
            targetCostumes = param5 as ReadonlyArray<number> | undefined;
            options = param6;
        }
        return this._computeMaterialDebtForServant(
            gameServant,
            currentEnhancements,
            currentCostumes,
            targetEnhancements,
            targetCostumes,
            options
        );
    }

    private static _computeMaterialDebtForServant(
        gameServant: Readonly<GameServant>,
        currentEnhancements: Readonly<ServantEnhancements>,
        currentCostumes: ReadonlyArray<number>,
        targetEnhancements: Readonly<ServantEnhancements>,
        targetCostumes?: ReadonlyArray<number>,
        options = this._defaultOptions
    ): MaterialDebtMap {

        const { include, exclude } = options;

        /**
         * The result map for the servant, instantiated with an entry for QP.
         */
        const result: MaterialDebtMap = {
            [GameItemConstants.QpItemId]: this._instantiateMaterialDebt()
        };

        if (include.skills) {
            this._updateResultForSkills(
                result,
                gameServant.skillMaterials,
                currentEnhancements.skills,
                targetEnhancements.skills,
                'skills',
                exclude?.lores
            );
        }

        if (include.appendSkills) {
            this._updateResultForSkills(
                result,
                gameServant.appendSkillMaterials,
                currentEnhancements.appendSkills,
                targetEnhancements.appendSkills,
                'appendSkills',
                exclude?.lores
            );
        }

        const targetAscension = targetEnhancements.ascension;
        if (include.ascensions && targetAscension !== undefined) {
            if (gameServant.ascensionMaterials) {
                for (const [key, ascension] of Object.entries(gameServant.ascensionMaterials)) {
                    const ascensionLevel = Number(key);
                    const currentAscension = currentEnhancements.ascension || 0;
                    /**
                     * Skip this ascension if the servant is already at least this level, or if this
                     * level beyond the targeted level.
                     */
                    if (currentAscension >= ascensionLevel || ascensionLevel > targetAscension) {
                        continue;
                    }
                    this._updateResultForEnhancement(result, ascension, 'ascensions');
                }
            }
        }

        if (include.costumes) {
            for (const [key, costume] of Object.entries(gameServant.costumes)) {
                const costumeId = Number(key);
                /*
                 * Skip if the costume is already unlocked, or if it is not targeted. If the
                 * targetCostumes set is undefined, then all costumes are target by default.
                 */
                if (currentCostumes.includes(costumeId) || (targetCostumes && !targetCostumes.includes(costumeId))) {
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
            const itemCount = ObjectUtils.getOrDefault(result, itemId, this._instantiateMaterialDebt);
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
    
    private static _addMaterialDebt(target: MaterialDebt, source: MaterialDebt): void {
        target.ascensions += source.ascensions;
        target.skills += source.skills;
        target.appendSkills += source.appendSkills;
        target.costumes += source.costumes;
        target.total += source.total;
    }

    private static _parseComputationOptionsFromPlan(plan: Readonly<Plan>): ComputationOptions {
        return {
            include: {
                ...plan.enabled
            }
        };
    }

    private static _parseComputationOptionsFromPlanServant(planServant: Readonly<PlanServant>): ComputationOptions {
        const { servant, ...include } = planServant.enabled;
        return {
            include
        };
    }

    private static _mergeComputationOptions(a: ComputationOptions, b: ComputationOptions): ComputationOptions {
        return {
            include: {
                ascensions: a.include.ascensions && b.include.ascensions,
                skills: a.include.skills && b.include.skills,
                appendSkills: a.include.appendSkills && b.include.appendSkills,
                costumes: a.include.costumes && b.include.costumes,
            }
            // TODO Add exclude
        };
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

    private static _instantiatePlanServantDebt(planServant: PlanServant): PlanServantDebt {
        const {
            type,
            gameId,
            current,
            target
        } = planServant;

        const result: PlanServantDebt = {
            type,
            gameId,
            current: PlanServantUtils.cloneEnhancements(current),
            target: PlanServantUtils.cloneEnhancements(target),
            materialDebt: {}
        };

        if (type === PlanServantType.Owned) {
            result.instanceId = (planServant as PlanServantOwned).instanceId;
        }

        return result;
    }

    private static _instantiatePlanDebt(): PlanDebt {
        return {
            servants: {
                [PlanServantType.Owned]: {},
                [PlanServantType.Unowned]: {},
            },
            planTotal: {},
            previousPlans: {},
            groupTotal: {},
            itemDebt: {}
        };
    }

    //#endregion

}