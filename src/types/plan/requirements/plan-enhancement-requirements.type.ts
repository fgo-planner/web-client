import { PlanEnhancementItemRequirements } from './plan-enhancement-item-requirements.type';

/**
 * Resources required to reach the targeted enhancement levels. Includes embers,
 * fous (TODO), items, and QP.
 */
export type PlanEnhancementRequirements = {
    embers: { [key in 1 | 2 | 3 | 4 | 5]: number };
    /**
     * Map of items required to reach the targeted enhancement levels. The key is
     * the item's ID, and the value is a breakdown of the quantities required for
     * each enhancement category.
     */
    items: Record<number, PlanEnhancementItemRequirements>;
    qp: number;
};
