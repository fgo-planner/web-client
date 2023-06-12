const Enhancements = 'Enhancements';
const Costumes = 'Costumes';

export type PlanRouteMasterItemsEditDialogTab =
    typeof Enhancements |
    typeof Costumes;

export const PlanRouteMasterItemsEditDialogTab = {
    Enhancements,
    Costumes
} as const;
