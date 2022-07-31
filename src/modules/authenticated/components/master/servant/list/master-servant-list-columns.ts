import { Immutable } from '../../../../../../types/internal';

export type MasterServantListColumnName =
    'npLevel' |
    'level' |
    'fouHp' |
    'fouAtk' |
    'skills' |
    'appendSkills' |
    'bondLevel';

export type MasterServantListVisibleColumns = Partial<Record<MasterServantListColumnName, boolean>>;

const ColumnWidths = {
    label: 300,
    stats: {
        npLevel: 120,
        level: 160,
        fou: 160, // *2 = 30% total
        skills: 160, // *2 = 30% total
        bondLevel: 120
    }
};

export const MasterServantListColumnWidths = ColumnWidths as Immutable<typeof ColumnWidths>;
