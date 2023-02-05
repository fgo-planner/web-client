import { ImmutableRecord } from '@fgo-planner/common-core';
import { DataTableListColumnProperties } from '../../../../../../types';

export namespace MasterServantListColumn {

    export type Name =
        'npLevel' |
        'level' |
        'fouHp' |
        'fouAtk' |
        'skills' |
        'appendSkills' |
        'bondLevel' |
        'summonDate';

    export type Visibility = Partial<Record<Name, boolean>>;

    // TODO Convert widths to use theme spacing/rem.
    export const Properties: ImmutableRecord<Name | 'label', DataTableListColumnProperties> = {
        label: {
            key: 'label',
            width: 300,
            label: 'Servant',
            sortable: false
        },
        npLevel: {
            key: 'np-level',
            width: 120,
            label: 'NP',
            sortable: true
        },
        level: {
            key: 'level',
            width: 160,
            label: 'Level',
            sortable: true
        },
        fouHp: {
            key: 'fou-hp',
            width: 160,
            label: 'Fou (HP)',
            sortable: true
        },
        fouAtk: {
            key: 'fou-atk',
            width: 160,
            label: 'Fou (ATK)',
            sortable: true
        },
        skills: {
            key: 'skills',
            width: 160,
            label: 'Skills',
            sortable: false
        },
        appendSkills: {
            key: 'append',
            width: 160,
            label: 'Append',
            sortable: false
        },
        bondLevel: {
            key: 'bond',
            width: 120,
            label: 'Bond',
            sortable: true
        },
        summonDate: {
            key: 'summonDate',
            width: 160,
            label: 'Summon Date',
            sortable: true
        }
    };

}