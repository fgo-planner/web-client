import { PlanServantRequirements } from './plan-servant-requirements.type';
import { PlanEnhancementRequirements } from './plan-enhancement-requirements.type';

/**
 * Computed enhancements requirements for the plan/plan group.
 */
export type PlanRequirements = {
    /**
     * Total enhancement requirements for the plan group. Only the target plan and
     * preceding plans are included; proceeding plans are excluded.
     */
    group: PlanEnhancementRequirements;
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
    previousPlans: Record<string, PlanEnhancementRequirements>;
    /**
     * Map of enhancement requirements for the servants in the target plan. The key
     * is a servant's `instanceId`, and the value is the enhancement requirements
     * for the servant.
     */
    servants: Record<number, PlanServantRequirements>;
    /**
     * Total enhancement requirements for the target plan.
     */
    targetPlan: PlanEnhancementRequirements;
};
