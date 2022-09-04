import { PlanServantEnhancements } from '@fgo-planner/data-types';
import { PlanEnhancementRequirements } from './plan-enhancement-requirements.type';

/**
 * Computed enhancement requirements for a servant in the target plan. Also
 * includes the effective current and target enhancement level used for the
 * computation.
 */
export type PlanServantRequirements = {
    instanceId: number;
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
    requirements: PlanEnhancementRequirements;
};
