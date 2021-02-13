import { ReadonlyRecord } from '.././../../types';
import { FgoManagerColumn } from './fgo-manager-column.enum';

export const FgoManagerColumnNames: ReadonlyRecord<FgoManagerColumn, string> = {
    [FgoManagerColumn.ServantName]: 'Name',
    [FgoManagerColumn.NoblePhantasmLevel]: 'NP',
    [FgoManagerColumn.Level]: 'Level',
    [FgoManagerColumn.SkillLevel1]: '1',
    [FgoManagerColumn.SkillLevel2]: '2',
    [FgoManagerColumn.SkillLevel3]: '3',
    [FgoManagerColumn.FouHp]: 'HP',
    [FgoManagerColumn.FouAtk]: 'ATK',
    [FgoManagerColumn.BondLevel]: 'Bond',
    [FgoManagerColumn.AcquisitionDate]: 'Acquisition'
};
