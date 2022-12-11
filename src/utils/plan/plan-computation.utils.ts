import { CollectionUtils, Immutable, ImmutableArray, Nullable, ObjectUtils, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameEmberRarity, GameServant, GameServantEnhancement, GameServantSkillMaterials, ImmutableMasterServant, ImmutablePlan, InstantiatedServantAscensionLevel, InstantiatedServantConstants, InstantiatedServantSkillLevel, InstantiatedServantUtils, MasterServantUpdate, MasterServantUpdateUtils, PlanResources, PlanServant, PlanServantAggregatedData, PlanServantUtils, PlanUpcomingResources } from '@fgo-planner/data-core';
import { PlanEnhancementItemRequirements as EnhancementItemRequirements, PlanEnhancementRequirements as EnhancementRequirements, PlanEnhancementRequirements, PlanRequirements, PlanServantRequirements } from '../../types';


//#region Exported type definitions

export type ComputationOptions = {
    includeAscensions?: boolean;
    includeSkills?: boolean;
    includeAppendSkills?: boolean;
    includeCostumes?: boolean;
    excludeLores?: boolean;
};

/**
 * Transformed master account data for plan computation.
 * 
 * TODO Move this to its own file.
 */
export type MasterAccountData = Readonly<{
    items: ReadonlyRecord<number, number>;
    costumes: ReadonlySet<number>;
    qp: number;
}>;

/**
 * Transformed plan account data for plan computation.
 * 
 * TODO Move this to its own file.
 */
export type PlanData = Readonly<{
    planId: string;
    enabled: ImmutablePlan['enabled'];
    servantsData: ReadonlyArray<PlanServantAggregatedData>;
    costumes: ReadonlySet<number>;
    upcomingResources: ImmutableArray<PlanUpcomingResources>;
}>;

export type ServantFulfillmentResult = {
    /**
     * The `MasterServantUpdate` that will effectively fulfill the planned
     * enhancement for the servant.
     */
    update: MasterServantUpdate;
    /**
     * The resources required to fulfill the planned enhancements for the servant.
     */
    requirements: PlanEnhancementRequirements;
};

//#endregion


//#region Internal type definitions

type SkillEnhancements = Readonly<{
    1?: Nullable<InstantiatedServantSkillLevel>;
    2?: Nullable<InstantiatedServantSkillLevel>;
    3?: Nullable<InstantiatedServantSkillLevel>;
}>;

type ServantEnhancements = Immutable<{
    ascension?: Nullable<InstantiatedServantAscensionLevel>;
    skills: SkillEnhancements;
    appendSkills: SkillEnhancements;
}>;

//#endregion


//#region Default values

const DefaultOptions: Readonly<ComputationOptions> = {
    includeAscensions: true,
    includeSkills: true,
    includeAppendSkills: true,
    includeCostumes: true
};

const DefaultTargetEnhancements: Immutable<ServantEnhancements> = {
    ascension: InstantiatedServantConstants.MaxAscensionLevel,
    skills: {
        1: InstantiatedServantConstants.MaxSkillLevel,
        2: InstantiatedServantConstants.MaxSkillLevel,
        3: InstantiatedServantConstants.MaxSkillLevel
    },
    appendSkills: {
        1: InstantiatedServantConstants.MaxSkillLevel,
        2: InstantiatedServantConstants.MaxSkillLevel,
        3: InstantiatedServantConstants.MaxSkillLevel,
    }
};

//#endregion


//#region


/**
 * Returns a `MasterServantUpdate` and the resources that will effectively
 * fulfill the planned enhancement for the servant. 
 *
 * Returns `null` if the servant plan is already fulfilled.
 */
export function fulfillServant(
    planServantData: PlanServantAggregatedData,
    currentCostumes: ReadonlySet<number>,
    targetCostumes: ReadonlySet<number>,
): ServantFulfillmentResult | null {

    const {
        gameServant,
        masterServant,
        planServant
    } = planServantData;

    if (PlanServantUtils.isAllDisabled(planServant)) {
        return null;
    }

    let hasEnhancements = false;
    const masterServantUpdate = MasterServantUpdateUtils.createFromExisting(masterServant);

    if (planServant.enabled.ascensions) {
        const {
            ascension: targetAscension = InstantiatedServantConstants.MinAscensionLevel,
            level: targetLevel = InstantiatedServantConstants.MinLevel
        } = planServant;

        if (targetAscension > masterServantUpdate.ascension) {
            masterServantUpdate.ascension = targetAscension;
            hasEnhancements = true;
        }
        if (targetLevel > masterServantUpdate.level) {
            masterServantUpdate.level = targetLevel;
            hasEnhancements = true;
        }
    }

    if (planServant.enabled.skills) {
        const {
            1: targetSkill1,
            2: targetSkill2,
            3: targetSkill3
        } = planServant.skills;

        const skills = masterServantUpdate.skills;

        if (targetSkill1 && targetSkill1 > skills[1]) {
            skills[1] = targetSkill1;
            hasEnhancements = true;
        }
        if (targetSkill2 && targetSkill2 > (skills[2] || 0)) {
            skills[2] = targetSkill2;
            hasEnhancements = true;
        }
        if (targetSkill3 && targetSkill3 > (skills[3] || 0)) {
            skills[3] = targetSkill3;
            hasEnhancements = true;
        }
    }

    if (planServant.enabled.appendSkills) {
        const {
            1: targetAppendSkill1,
            2: targetAppendSkill2,
            3: targetAppendSkill3
        } = planServant.appendSkills;

        const appendSkills = masterServantUpdate.appendSkills;

        if (targetAppendSkill1 && targetAppendSkill1 > (appendSkills[1] || 0)) {
            appendSkills[1] = targetAppendSkill1;
            hasEnhancements = true;
        }
        if (targetAppendSkill2 && targetAppendSkill2 > (appendSkills[2] || 0)) {
            appendSkills[2] = targetAppendSkill2;
            hasEnhancements = true;
        }
        if (targetAppendSkill3 && targetAppendSkill3 > (appendSkills[3] || 0)) {
            appendSkills[3] = targetAppendSkill3;
            hasEnhancements = true;
        }
    }

    if (planServant.enabled.costumes && targetCostumes.size) {
        const unlockedCostumes = masterServantUpdate.unlockedCostumes;
        for (const key of Object.keys(gameServant.costumes)) {
            const costumeId = Number(key);
            if (targetCostumes.has(costumeId) && !unlockedCostumes.get(costumeId)) {
                unlockedCostumes.set(costumeId, true);
                hasEnhancements = true;
            }
        }
    }

    if (!hasEnhancements) {
        return null;
    }

    const requirements = _computeServantEnhancementRequirements(
        gameServant,
        masterServant,
        currentCostumes,
        planServant,
        targetCostumes
    );

    return {
        update: masterServantUpdate,
        requirements
    };
}

//#endregion


//#region computePlanRequirements + helper functions

/**
 * Computes the material deficit for the given plan, and optionally the other plans
 * from the plan group, if any.
 *
 * @param targetPlanData The target plan data.
 * @param masterAccountData Master account data.
 * @param previousPlans (optional) Plans that precede the target plan. This
 * should exclude the target plan itself and any proceeding plans.
 */
export function computePlanRequirements(
    targetPlanData: PlanData,
    masterAccountData: MasterAccountData,
    previousPlansData?: ReadonlyArray<PlanData>,
    optionsOverride?: ComputationOptions
): PlanRequirements {

    const start = window.performance.now();

    /**
     * The computation result. This will be updated as each plan is computed.
     */
    const result = instantiatePlanRequirements();

    /**
     * The computation options. If options override was not given, then use options
     * from target plan.
     */
    const options = optionsOverride || _parseComputationOptions(targetPlanData);

    /**
     * Run computations for previous plans in the group first.
     */
    previousPlansData?.forEach(previousPlanData => {
        _computePlanRequirements(
            result,
            previousPlanData,
            masterAccountData,
            options
        );
    });
    /**
     * Finally, run computations for the target plan.
     */
    _computePlanRequirements(
        result,
        targetPlanData,
        masterAccountData,
        options,
        true
    );

    /**
     * Compute/copy resources data.
     */
    _computePlanResources(
        result,
        targetPlanData,
        masterAccountData
    );

    const end = window.performance.now();
    console.log(`Plan deficit took ${(end - start).toFixed(2)}ms to compute.`);
    return result;
}

function _computePlanRequirements(
    result: PlanRequirements,
    planData: PlanData,
    masterAccountData: MasterAccountData,
    options: ComputationOptions,
    isTargetPlan = false
): void {

    for (const planServantData of planData.servantsData) {
        const {
            gameServant,
            masterServant,
            planServant
        } = planServantData;
        /**
         * Skip the servant if it is not enabled.
         */
        if (PlanServantUtils.isAllDisabled(planServant)) {
            continue;
        }
        /**
         * Compute the options based on a merge of the plan and servant options.
         */
        /** */
        const servantOptions = _parseComputationOptions(planServant);
        const mergedOptions = _mergeComputationOptions(options, servantOptions);
        /**
         * Compute the deficit for the servant for the current plan.
         */
        /** */
        const servantComputationResult = _computePlanServantRequirements(
            result,
            gameServant,
            masterServant,
            planServant,
            masterAccountData.costumes,
            planData.costumes,
            mergedOptions
        );

        if (!servantComputationResult) {
            continue;
        }

        const [planServantRequirements, enhancementRequirements] = servantComputationResult;
        /**
         * Update the result with the computed data.
         */
        /** */
        let planEnhancementRequirements: EnhancementRequirements;
        if (isTargetPlan) {
            _addEnhancementRequirements(planServantRequirements.requirements, enhancementRequirements);
            planEnhancementRequirements = result.requirements.targetPlan;
        } else {
            planEnhancementRequirements = ObjectUtils.getOrDefault(
                result.requirements.previousPlans,
                planData.planId,
                _instantiateEnhancementRequirements
            );
        }
        _addEnhancementRequirements(planEnhancementRequirements, enhancementRequirements);
        _addEnhancementRequirements(result.requirements.group, enhancementRequirements);
    }

    // TODO Compute the grand total in the `result.itemDebt`;
}

function _computePlanServantRequirements(
    result: PlanRequirements,
    gameServant: Immutable<GameServant>,
    masterServant: ImmutableMasterServant,
    planServant: Immutable<PlanServant>,
    currentCostumes: ReadonlySet<number>,
    targetCostumes: ReadonlySet<number>,
    options: ComputationOptions
): [PlanServantRequirements, EnhancementRequirements] | undefined {

    const { instanceId } = planServant;
    const resultServants = result.requirements.servants;

    let planServantRequirements = resultServants[instanceId];
    if (!planServantRequirements) {
        /**
         * If the plan servant does not yet exist in the result, then instantiate it and
         * add it to the result.
         */
        planServantRequirements = _instantiatePlanServantRequirements(planServant, masterServant);
        resultServants[instanceId] = planServantRequirements;
    } else {
        /**
         * If the plan servant was already in the result, then it was from a previous
         * plan in the group. This means the for the current plan, the previous target
         * enhancements should be the new current, and the target values from the plan
         * should be the new target.
         */
        InstantiatedServantUtils.updateEnhancements(planServantRequirements.current, planServantRequirements.target);
        InstantiatedServantUtils.updateEnhancements(planServantRequirements.target, planServant);
    }

    const { current, target } = planServantRequirements;

    const enhancementRequirements = _computeServantEnhancementRequirements(
        gameServant,
        current,
        currentCostumes,
        target,
        targetCostumes,
        options
    );

    return [planServantRequirements, enhancementRequirements];
}

/**
 * Computes and populates the resources for the given `PlanRequirements`.
 */
function _computePlanResources(
    result: PlanRequirements,
    planData: PlanData,
    masterAccountData: MasterAccountData
): void {
    /**
     * Copy master account resources. Deep cloning should not be needed here because
     * the returned data is expected to be readonly/immutable.
     * 
     * TODO Copy embers
     */
    result.resources.current.items = masterAccountData.items;
    result.resources.current.qp = masterAccountData.qp;
    /**
     * Compute the total upcoming resources.
     */
    /** */
    result.resources.upcoming = _sumPlanResources(planData.upcomingResources);
    /**
     * Compute the total resource deficit.
     */
    _computeResourceDebt(result);
}

/**
 * Computes and populates the resource deficit for the given `PlanRequirements`.
 * Assumes that the `resources.current` and `resources.upcoming` data sets are
 * already populated.
 */ 
function _computeResourceDebt(result: PlanRequirements): void {
    const requiredResources = result.requirements.group;
    const currentResources = result.resources.current;
    const upcomingResources = result.resources.upcoming;
    const deficitResources = result.resources.deficit;

    let required: number, 
        current: number, 
        upcoming: number, 
        deficit: number;

    /**
     * Items
     */
    /** */
    const currentItems = currentResources.items;
    const upcomingItems = upcomingResources.items;
    const deficitItems = deficitResources.items;
    for (const [key, value] of Object.entries(requiredResources.items)) {
        const itemId = Number(key);
        required = value.total;
        current = currentItems[itemId] || 0;
        upcoming = upcomingItems[itemId] || 0;
        deficit = Math.max(required - current - upcoming, 0);
        if (deficit) {
            deficitItems[itemId] = deficit;
        }
    }

    /**
     * QP
     */
    required = requiredResources.qp;
    current = currentResources.qp;
    upcoming = upcomingResources.qp;
    deficit = Math.max(required - current - upcoming, 0);
    if (deficit) {
        deficitResources.qp = deficit;
    }

    /**
     * TODO Embers
     */
}

//#endregion


//#region computeServantRequirements + helper functions

export function computeServantEnhancementRequirements(
    gameServant: Immutable<GameServant>,
    currentEnhancements: ServantEnhancements,
    currentCostumes: Iterable<number>,
    options?: ComputationOptions
): EnhancementRequirements {

    const currentCostumeSet = CollectionUtils.toReadonlySet(currentCostumes);

    return _computeServantEnhancementRequirements(
        gameServant,
        currentEnhancements,
        currentCostumeSet,
        DefaultTargetEnhancements,
        undefined,
        options
    );
}

function _computeServantEnhancementRequirements(
    gameServant: Immutable<GameServant>,
    currentEnhancements: Immutable<ServantEnhancements>,
    currentCostumes: ReadonlySet<number>,
    targetEnhancements: Immutable<ServantEnhancements>,
    targetCostumes?: ReadonlySet<number>,
    options = DefaultOptions
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
    const result = _instantiateEnhancementRequirements();

    if (includeSkills) {
        _updateResultForSkills(
            result,
            gameServant.skillMaterials,
            currentEnhancements.skills,
            targetEnhancements.skills,
            'skills',
            excludeLores
        );
    }

    if (includeAppendSkills) {
        _updateResultForSkills(
            result,
            gameServant.appendSkillMaterials,
            currentEnhancements.appendSkills,
            targetEnhancements.appendSkills,
            'appendSkills',
            excludeLores
        );
    }

    const targetAscension = targetEnhancements.ascension;
    if (includeAscensions && targetAscension != null) {
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
                _updateEnhancementRequirementResult(result, ascension, 'ascensions');
            }
        }
        // TODO Compute ember requirements
    }

    if (includeCostumes) {
        for (const [key, costume] of Object.entries(gameServant.costumes)) {
            const costumeId = Number(key);
            /**
             * Skip if the costume is already unlocked, or if it is not targeted. If the
             * targetCostumes set is undefined, then all costumes are target by default.
             */
            if (currentCostumes.has(costumeId) || (targetCostumes && !targetCostumes.has(costumeId))) {
                continue;
            }
            _updateEnhancementRequirementResult(result, costume.materials, 'costumes');
        }
    }

    return result;
}

function _updateResultForSkills(
    result: EnhancementRequirements,
    skillMaterials: Immutable<GameServantSkillMaterials>,
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
        if (excludeLores && skillLevel === (InstantiatedServantConstants.MaxSkillLevel - 1)) {
            continue;
        }
        /**
         * The number of skills that need to be upgraded to this level. A skill does not
         * need to be upgraded if it is already at least this level, or if this level beyond
         * the targeted level.
         */
        /** */
        const skillUpgradeCount =
            (currentSkill1 > skillLevel || skillLevel >= targetSkill1 ? 0 : 1) +
            (currentSkill2 > skillLevel || skillLevel >= targetSkill2 ? 0 : 1) +
            (currentSkill3 > skillLevel || skillLevel >= targetSkill3 ? 0 : 1);
        /**
         * Skip if all three skills do not need enhancement at this level.
         */
        if (skillUpgradeCount === 0) {
            continue;
        }
        _updateEnhancementRequirementResult(result, skill, skillType, skillUpgradeCount);
    }
}

function _updateEnhancementRequirementResult(
    result: EnhancementRequirements,
    enhancement: Immutable<GameServantEnhancement>,
    propertyKey: keyof EnhancementItemRequirements,
    enhancementCount = 1
): void {
    /**
     * Update material count.
     */
    for (const [key, quantity] of Object.entries(enhancement.materials)) {
        const itemId = Number(key);
        const itemCount = ObjectUtils.getOrDefault(result.items, itemId, _instantiateEnhancementItemRequirements);
        const total = quantity * enhancementCount;
        itemCount[propertyKey] += total;
        itemCount.total += total;
    }
    /**
     * Also update QP count.
     */
    result.qp += enhancement.qp * enhancementCount;
}

//#endregion


//#region Other helper functions

/**
 * Takes an array of `EnhancementRequirements` and returns a new
 * `EnhancementRequirements` containing the sum of all the values.
 */
export function sumEnhancementRequirements(enhancementRequirements: ImmutableArray<EnhancementRequirements>): EnhancementRequirements {
    const result = _instantiateEnhancementRequirements();
    for (const requirements of enhancementRequirements) {
        _addEnhancementRequirements(result, requirements);
    }
    return result;
}

/**
 * Adds the values from the source `EnhancementRequirements` to the target
 * `EnhancementRequirements`.
 */
function _addEnhancementRequirements(target: EnhancementRequirements, source: Immutable<EnhancementRequirements>): void {
    const targetEmbers = target.embers;
    for (const [key, value] of Object.entries(source.embers)) {
        const rarity = Number(key) as GameEmberRarity;
        targetEmbers[rarity] += value;
    }
    const targetItems = target.items;
    for (const [key, value] of Object.entries(source.items)) {
        const itemId = Number(key);
        const targetItem = targetItems[itemId];
        if (!targetItem) {
            targetItems[itemId] = { ...value };
        } else {
            targetItem.ascensions += value.ascensions;
            targetItem.skills += value.skills;
            targetItem.appendSkills += value.appendSkills;
            targetItem.costumes += value.costumes;
            targetItem.total += value.total;
        }
    }
    target.qp += source.qp;
}

/**
 * Takes an array of `PlanResources` and returns a new `PlanResources`
 * containing the sum of all the values.
 */
function _sumPlanResources(resources: ImmutableArray<PlanResources>): PlanResources {
    const result = _instantiatePlanResources();
    for (const enhancementRequirements of resources) {
        _addPlanResources(result, enhancementRequirements);
    }
    return result;
}

/**
 * Adds the values from the source `PlanResources` to the target
 * `PlanResources`.
 */
function _addPlanResources(target: PlanResources, source: Immutable<PlanResources>): void {
    const targetEmbers = target.embers;
    for (const [key, value] of Object.entries(source.embers)) {
        const rarity = Number(key) as GameEmberRarity;
        if (!targetEmbers[rarity]) {
            targetEmbers[rarity] = value;
        } else {
            targetEmbers[rarity]! += value;
        }
    }
    const targetItems = target.items;
    for (const [key, value] of Object.entries(source.items)) {
        const itemId = Number(key);
        if (!targetItems[itemId]) {
            targetItems[itemId] = value;
        } else {
            targetItems[itemId] += value;
        }
    }
    target.qp += source.qp;
}

function _parseComputationOptions(data: PlanData | Immutable<PlanServant>): ComputationOptions {
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

function _mergeComputationOptions(a: ComputationOptions, b: ComputationOptions): ComputationOptions {
    return {
        includeAscensions: a.includeAscensions && b.includeAscensions,
        includeSkills: a.includeSkills && b.includeSkills,
        includeAppendSkills: a.includeAppendSkills && b.includeAppendSkills,
        includeCostumes: a.includeCostumes && b.includeCostumes,
        excludeLores: a.excludeLores && b.excludeLores
    };
}

//#endregion


//#region Instantiation functions


export function instantiatePlanRequirements(): PlanRequirements {
    return {
        requirements: {
            servants: {},
            targetPlan: _instantiateEnhancementRequirements(),
            previousPlans: {},
            group: _instantiateEnhancementRequirements(),
        },
        resources: {
            current: _instantiatePlanResources(),
            deficit: _instantiatePlanResources(),
            upcoming: _instantiatePlanResources()
        }
    };
}

function _instantiateEnhancementItemRequirements(): EnhancementItemRequirements {
    return {
        ascensions: 0,
        skills: 0,
        appendSkills: 0,
        costumes: 0,
        total: 0
    };
}

function _instantiateEnhancementRequirements(): EnhancementRequirements {
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

function _instantiatePlanResources(): PlanResources {
    return {
        embers: {},
        items: {},
        qp: 0
    };
}

/**
 * Instantiates a `PlanServantRequirements` object using the given plan and
 * master servant data. The `current` enhancement fo the resulting object will
 * be initialized with the values from the master servant.
 */
function _instantiatePlanServantRequirements(
    planServant: Immutable<PlanServant>,
    masterServant: ImmutableMasterServant
): PlanServantRequirements {

    const current = InstantiatedServantUtils.instantiateEnhancements();
    InstantiatedServantUtils.updateEnhancements(current, masterServant);

    const target = InstantiatedServantUtils.cloneEnhancements(planServant);

    return {
        instanceId: planServant.instanceId,
        current,
        target,
        requirements: _instantiateEnhancementRequirements()
    };
}

//#endregion
