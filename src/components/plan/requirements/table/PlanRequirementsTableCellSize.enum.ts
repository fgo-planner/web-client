const Normal = 'Normal';
const Condensed = 'Condensed';

export type PlanRequirementsTableCellSize =
    typeof Normal |
    typeof Condensed;

export const PlanRequirementsTableCellSize = {
    Normal,
    Condensed
} as const;
