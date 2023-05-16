const Name = 'Name';
const Targets = 'Targets';
const Toggle = 'Toggle';

export type PlanRequirementsTableServantRowHeaderLayout =
    typeof Name |
    typeof Targets |
    typeof Toggle;

export const PlanRequirementsTableServantRowHeaderLayout = {
    Name,
    Targets,
    Toggle
} as const;
