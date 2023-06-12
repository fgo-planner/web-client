const General = 'General';
const Enhancements = 'Enhancements';
const Costumes = 'Costumes';

export type MasterServantEditDialogTab =
    typeof General |
    typeof Enhancements |
    typeof Costumes;

export const MasterServantEditDialogTab = {
    General,
    Enhancements,
    Costumes
} as const;
