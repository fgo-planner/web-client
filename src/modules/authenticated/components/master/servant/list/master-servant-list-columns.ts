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
    info: '32%',
    stats: {
        container: '68%',
        npLevel: '12.5%',
        level: '15%',
        fou: '15%', // *2 = 30% total
        skills: '15%', // *2 = 30% total
        bondLevel: '12.5%'
    },
    actions: '120px'
};

export const MasterServantListColumnWidths = ColumnWidths as Immutable<typeof ColumnWidths>;
