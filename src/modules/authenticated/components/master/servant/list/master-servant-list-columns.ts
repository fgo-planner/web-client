type MasterServantListColumns<T> = {
    label: T;
    npLevel: T;
    level: T;
    fouHp: T;
    fouAtk: T;
    skills: T;
    appendSkills: T;
    bondLevel: T;
    actions: T;
};

export type MasterServantListVisibleColumns = Omit<MasterServantListColumns<boolean>, 'label'>;

export const MasterServantListColumnWidths: Readonly<MasterServantListColumns<string | number>> = {
    label: '32%',
    npLevel: '9%',
    level: '10%',
    fouHp: '10%',
    fouAtk: '10%',
    skills: '10%',
    appendSkills: '10%',
    bondLevel: '9%',
    actions: '120px'
};
