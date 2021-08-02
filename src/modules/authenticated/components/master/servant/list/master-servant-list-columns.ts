// TODO Add column for append skills

type MasterServantListColumns<T> = {
    label: T;
    npLevel: T;
    level: T;
    fouHp: T;
    fouAtk: T;
    skillLevels: T;
    bondLevel: T;
    actions: T;
};

export type MasterServantListVisibleColumns = Omit<MasterServantListColumns<boolean>, 'label'>;

export const MasterServantListColumnWidths: Readonly<MasterServantListColumns<string | number>> = {
    label: '35%',
    npLevel: '10%',
    level: '11%',
    fouHp: '11%',
    fouAtk: '11%',
    skillLevels: '11%',
    bondLevel: '11%',
    actions: '120px'
};
