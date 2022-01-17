import { GameServant, GameServantEnhancement, GameServantSkillMaterials, MasterAccount, MasterServant, MasterServantAscensionLevel, MasterServantSkillLevel, Plan, PlanServant, PlanServantEnhancements, PlanServantOwned, PlanServantType } from '@fgo-planner/types';
import { GameServantConstants } from '../../constants';
import { GameServantMap, ReadonlyRecord } from '../../types/internal';
import { ArrayUtils } from '../array.utils';
import { ObjectUtils } from '../object.utils';
import { PlanServantUtils } from './plan-servant.utils';

//#region Exported type definitions

export type ComputationOptions = {
    includeAscensions?: boolean;
    includeSkills?: boolean;
    includeAppendSkills?: boolean;
    includeCostumes?: boolean;
    excludeLores?: boolean;
};

/**
 * Breakdown of the quantities required for each enhancement category for a
 * single item.
 */
export type ItemRequirements = {
    ascensions: number;
    skills: number;
    appendSkills: number;
    costumes: number;
    total: number;
};

/**
 * Map of items required to reach the targeted enhancement levels. The key is
 * the item's ID, and the value is a breakdown of the quantities required for
 * each enhancement category.
 */
export type ItemRequirementMap = Record<number, ItemRequirements>;

/**
 * Resources required to reach the targeted enhancement levels. Includes embers,
 * fous (TODO), items, and QP.
 */
export type EnhancementRequirements = {
    embers: { [key in 1 | 2 | 3 | 4 | 5]: number };
    // TODO Add fous
    items: ItemRequirementMap;
    qp: number;
};

/**
 * Computed enhancement requirements for a servant in the target plan. Also
 * includes the effective current and target enhancement level used for the
 * computation.
 */
export type PlanServantRequirements = {
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
    /**
     * Requirements for enhancing the servant only for the target plan.
     */
    requirements: EnhancementRequirements;
};

/**
 * Computed enhancements requirements for the plan/plan group.
 */
export type PlanRequirements = {
    /**
     * Total enhancement requirements for the plan group. Only the target plan and
     * preceding plans are included; proceeding plans are excluded.
     */
    group: EnhancementRequirements;
    /**
     * Map of item quantities needed based on master's current inventory.
     */
    itemDebt: Record<number, number>; // TODO Is this needed here?
    /**
     * Enhancement requirements for individual plans that precede target plan within
     * the plan group. Does not include the target plan or any proceeding plans.
     *
     * This is a map where the key is the `_id` field of the plan, and the value is
     * the material debt total for the plan.
     */
    previousPlans: Record<string, EnhancementRequirements>;
    /**
     * Enhancement requirements for the servants in the target plan.
     */
    servants: {
        [PlanServantType.Owned]: Record<number, PlanServantRequirements>;
        [PlanServantType.Unowned]: Record<number, PlanServantRequirements>;
    }
    /**
     * Total enhancement requirements for the target plan.
     */
    targetPlan: EnhancementRequirements;
};

//#endregion


//#region Internal type definitions

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
     * Item quantities held by the master account, mapped by the items' `itemId`
     * value.
     */
    items: ReadonlyRecord<number, number>;
    /**
     * Servants owned by the master account, mapped by the servants' `instanceId`
     * value.
     */
    servants: ReadonlyRecord<number, Readonly<MasterServant>>;
    costumes: ReadonlySet<number>;
    qp: number;
}>;

//#endregion


export class PlanComputationUtils {

    private static get _defaultOptions(): Readonly<ComputationOptions> {
        return {
            includeAscensions: true,
            includeSkills: true,
            includeAppendSkills: true,
            includeCostumes: true
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
     * Adds the values from the source `EnhancementRequirements` to the target
     * `EnhancementRequirements`. Only the the target map will be updated; the
     * values of the source map will not be changed.
     */
    static addEnhancementRequirements(target: EnhancementRequirements, source: EnhancementRequirements): void {
        const targetEmbers = target.embers;
        for (const [key, value] of Object.entries(source.embers)) {
            const rarity = Number(key) as 1 | 2 | 3 | 4 | 5;
            targetEmbers[rarity] += value;
        }
        const targetItems = target.items;
        for (const [key, value] of Object.entries(source.items)) {
            const itemId = Number(key);
            if (!targetItems[itemId]) {
                targetItems[itemId] = { ...value };
            } else {
                this._addItemRequirements(targetItems[itemId], value);
            }
        }
        target.qp += source.qp;
    }

    /**
     * Takes an array of `EnhancementRequirements` and returns a new
     * `EnhancementRequirements` containing the sum of all the values.
     */
    static sumEnhancementRequirements(arr: Array<EnhancementRequirements>): EnhancementRequirements {
        const result = this._instantiateEnhancementRequirements();
        for (const enhancementRequirements of arr) {
            this.addEnhancementRequirements(result, enhancementRequirements);
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

    //#region computePlanRequirements + helper methods

    /**
     * Computes the material debt for the given plan, and optionally the other plans
     * from the plan group, if any.
     *
     * @param gameServantMap Game servant map data.
     * @param masterAccount Master account data.
     * @param targetPlan The target plan.
     * @param previousPlans (optional) Plans that precede the target plan. This
     * should exclude the target plan itself and any proceeding plans.
     */
    static computePlanRequirements(
        gameServantMap: GameServantMap,
        masterAccount: Readonly<MasterAccount>,
        targetPlan: Readonly<Plan>,
        previousPlans?: ReadonlyArray<Plan>,
        optionsOverride?: ComputationOptions
    ): PlanRequirements {

        const start = window.performance.now();

        /**
         * The computation result. This will be updated as each plan is computed.
         */
        const result = this._instantiatePlanRequirements();

        /**
         * Pre-processed master account data.
         */
        const masterAccountData = this._preProcessMasterAccount(masterAccount);

        /**
         * The computation options. If options override was not given, then use options
         * from target plan.
         */
        const options = optionsOverride || this._parseComputationOptions(targetPlan);

        /*
         * Run computations for previous plans in the group first.
         */
        previousPlans?.forEach(plan => {
            this._computePlanRequirements(
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
        this._computePlanRequirements(
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

    private static _computePlanRequirements(
        result: PlanRequirements,
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
            const servantOptions = this._parseComputationOptions(planServant);
            options = this._mergeComputationOptions(options, servantOptions);
            /*
             * Compute the debt for the servant for the current plan.
             */
            const servantComputationResult = this._computePlanServantRequirements(
                result,
                gameServant,
                planServant,
                masterAccountData,
                options
            );

            if (!servantComputationResult) {
                continue;
            }

            const [planServantRequirements, enhancementRequirements] = servantComputationResult;
            /*
             * Update the result with the computed data.
             */
            let planRequirements: EnhancementRequirements;
            if (isTargetPlan) {
                this.addEnhancementRequirements(planServantRequirements.requirements, enhancementRequirements);
                planRequirements = result.targetPlan;
            } else {
                planRequirements = ObjectUtils.getOrDefault(result.previousPlans, plan._id, this._instantiateEnhancementRequirements);
            }
            this.addEnhancementRequirements(planRequirements, enhancementRequirements);
            this.addEnhancementRequirements(result.group, enhancementRequirements);
        }

        // TODO Compute the grand total in the `result.itemDebt`;
    }

    private static _computePlanServantRequirements(
        result: PlanRequirements,
        gameServant: Readonly<GameServant>,
        planServant: Readonly<PlanServant>,
        masterAccountData: MasterAccountData,
        options: ComputationOptions
    ): [PlanServantRequirements, EnhancementRequirements] | undefined {

        /**
         * This is the `instanceId` for owned servants, or `gameId` for unowned
         * servants.
         */
        const key = this.getKeyForPlanServant(planServant);

        const resultServants = result.servants[planServant.type];

        let planServantRequirements = resultServants[key];
        if (!planServantRequirements) {
            /*
             * If the plan servant does not yet exist in the result, then instantiate it and
             * add it to the result.
             */
            planServantRequirements = this._instantiatePlanServantRequirements(planServant);
            resultServants[key] = planServantRequirements;
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
                PlanServantUtils.updateEnhancements(planServantRequirements.current, masterServant);
            }
        } else {
            /*
             * If the plan servant was already in the result, then it was from a previous
             * plan in the group. This means the for the current plan, the previous target
             * enhancements should be the new current, and the target values from the plan
             * should be the new target.
             */
            PlanServantUtils.updateEnhancements(planServantRequirements.current, planServantRequirements.target);
            PlanServantUtils.updateEnhancements(planServantRequirements.target, planServant.target);
        }

        const { current, target } = planServantRequirements;

        const enhancementRequirements = this._computeServantRequirements(
            gameServant,
            current,
            current.costumes,
            target,
            target.costumes,
            options
        );

        return [planServantRequirements, enhancementRequirements];
    }

    private static _preProcessMasterAccount(masterAccount: Readonly<MasterAccount>): MasterAccountData {
        const servants = ArrayUtils.mapArrayToObject(masterAccount.servants, servant => servant.instanceId);
        const items = ArrayUtils.mapArrayToObject(masterAccount.items, item => item.itemId, item => item.quantity);
        const costumes = new Set(masterAccount.costumes);
        const qp = masterAccount.qp;

        return { servants, items, costumes, qp };
    }

    //#endregion


    //#region computeServantRequirements + helper methods

    static computeServantRequirements(
        gameServant: Readonly<GameServant>,
        currentEnhancements: ServantEnhancements,
        currentCostumes: ReadonlyArray<number>,
        options?: ComputationOptions
    ): EnhancementRequirements {

        return this._computeServantRequirements(
            gameServant,
            currentEnhancements,
            currentCostumes,
            this._defaultTargetEnhancements,
            undefined,
            options
        );
    }

    private static _computeServantRequirements(
        gameServant: Readonly<GameServant>,
        currentEnhancements: Readonly<ServantEnhancements>,
        currentCostumes: ReadonlyArray<number>,
        targetEnhancements: Readonly<ServantEnhancements>,
        targetCostumes?: ReadonlyArray<number>,
        options = this._defaultOptions
    ): EnhancementRequirements {

        const { 
            includeAscensions,
            includeSkills,
            includeAppendSkills,
            includeCostumes,
            excludeLores
        } = options;

        /**
         * The result data for the servant, instantiated with an entry for QP.
         */
        const result = this._instantiateEnhancementRequirements();

        if (includeSkills) {
            this._updateResultForSkills(
                result,
                gameServant.skillMaterials,
                currentEnhancements.skills,
                targetEnhancements.skills,
                'skills',
                excludeLores
            );
        }

        if (includeAppendSkills) {
            this._updateResultForSkills(
                result,
                gameServant.appendSkillMaterials,
                currentEnhancements.appendSkills,
                targetEnhancements.appendSkills,
                'appendSkills',
                excludeLores
            );
        }

        const targetAscension = targetEnhancements.ascension;
        if (includeAscensions && targetAscension !== undefined) {
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
                    this._updateEnhancementRequirementResult(result, ascension, 'ascensions');
                }
            }
            // TODO Compute ember requirements
        }

        if (includeCostumes) {
            for (const [key, costume] of Object.entries(gameServant.costumes)) {
                const costumeId = Number(key);
                /*
                 * Skip if the costume is already unlocked, or if it is not targeted. If the
                 * targetCostumes set is undefined, then all costumes are target by default.
                 */
                if (currentCostumes.includes(costumeId) || (targetCostumes && !targetCostumes.includes(costumeId))) {
                    continue;
                }
                this._updateEnhancementRequirementResult(result, costume.materials, 'costumes');
            }
        }

        return result;
    }

    private static _updateResultForSkills(
        result: EnhancementRequirements,
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
            this._updateEnhancementRequirementResult(result, skill, skillType, skillUpgradeCount);
        }
    }

    private static _updateEnhancementRequirementResult(
        result: EnhancementRequirements,
        enhancement: GameServantEnhancement,
        key: keyof ItemRequirements,
        enhancementCount = 1
    ): void {
        /*
         * Update material count.
         */
        for (const { itemId, quantity } of enhancement.materials) {
            const itemCount = ObjectUtils.getOrDefault(result.items, itemId, this._instantiateItemRequirements);
            const total = quantity * enhancementCount;
            itemCount[key] += total;
            itemCount.total += total;
        }
        /*
         * Also update QP count.
         */
        result.qp += enhancement.qp * enhancementCount;
    }

    //#endregion


    //#region Other helper methods
    
    private static _addItemRequirements(target: ItemRequirements, source: ItemRequirements): void {
        target.ascensions += source.ascensions;
        target.skills += source.skills;
        target.appendSkills += source.appendSkills;
        target.costumes += source.costumes;
        target.total += source.total;
    }

    private static _parseComputationOptions(data: Readonly<Plan> | Readonly<PlanServant>): ComputationOptions {
        const {
            ascensions,
            skills,
            appendSkills,
            costumes
        } = data.enabled;

        return {
            includeAscensions: ascensions,
            includeSkills: skills,
            includeAppendSkills: appendSkills,
            includeCostumes: costumes
        };
    }

    private static _mergeComputationOptions(a: ComputationOptions, b: ComputationOptions): ComputationOptions {
        return {
            includeAscensions: a.includeAscensions && a.includeAscensions,
            includeSkills: a.includeSkills && b.includeSkills,
            includeAppendSkills: a.includeAppendSkills && b.includeAppendSkills,
            includeCostumes: a.includeCostumes && b.includeCostumes,
            excludeLores: a.excludeLores && b.excludeLores
        };
    }

    //#endregion


    //#region Instantiation methods

    private static _instantiateItemRequirements(): ItemRequirements {
        return {
            ascensions: 0,
            skills: 0,
            appendSkills: 0,
            costumes: 0,
            total: 0
        };
    }

    private static _instantiateEnhancementRequirements(): EnhancementRequirements {
        return {
            embers: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0
            },
            items: {},
            qp: 0
        };
    }

    private static _instantiatePlanServantRequirements(planServant: PlanServant): PlanServantRequirements {
        const {
            type,
            gameId,
            current,
            target
        } = planServant;

        const result: PlanServantRequirements = {
            type,
            gameId,
            current: PlanServantUtils.cloneEnhancements(current),
            target: PlanServantUtils.cloneEnhancements(target),
            requirements: this._instantiateEnhancementRequirements()
        };

        if (type === PlanServantType.Owned) {
            result.instanceId = (planServant as PlanServantOwned).instanceId;
        }

        return result;
    }

    private static _instantiatePlanRequirements(): PlanRequirements {
        return {
            servants: {
                [PlanServantType.Owned]: {},
                [PlanServantType.Unowned]: {},
            },
            targetPlan: this._instantiateEnhancementRequirements(),
            previousPlans: {},
            group: this._instantiateEnhancementRequirements(),
            itemDebt: {}
        };
    }

    //#endregion

}