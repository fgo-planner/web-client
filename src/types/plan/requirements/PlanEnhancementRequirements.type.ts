import { GameEmberRarity } from '@fgo-planner/data-core';
import { PlanEnhancementItemRequirements } from './PlanEnhancementItemRequirements.type';

/**
 * Container object for resource count.
 */
export type PlanEnhancementRequirements = {
    embers: Record<GameEmberRarity, number>;
    /**
     * Map of items required to reach the targeted enhancement levels. The key is
     * the item's ID, and the value is a breakdown of the quantities required for
     * each enhancement category.
     */
    items: Record<number, PlanEnhancementItemRequirements>;
    qp: number;
};
