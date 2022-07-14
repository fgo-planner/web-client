import { Immutable } from '../../../../../../types/internal';

export type MasterServantListVisibleColumns = {
    npLevel?: boolean;
    level?: boolean;
    fouHp?: boolean;
    fouAtk?: boolean;
    skills?: boolean;
    appendSkills?: boolean;
    bondLevel?: boolean;
    actions?: boolean;
};

const ColumnWidths = {
    label: 300,
    stats: {
        npLevel: 120,
        level: 160,
        fou: 160, // *2 = 30% total
        skills: 160, // *2 = 30% total
        bondLevel: 120
    },
    actions: '120px'
};

export const MasterServantListColumnWidths = ColumnWidths as Immutable<typeof ColumnWidths>;
