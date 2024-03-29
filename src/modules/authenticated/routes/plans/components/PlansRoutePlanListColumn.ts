import { ImmutableRecord } from '@fgo-planner/common-core';
import { DataTableListColumnProperties } from '../../../../../types';

export namespace PlansRoutePlanListColumn {

    export type Name =
        'name' |
        'description' |
        'created' |
        'modified';

    export type Visibility = Record<Name, boolean>;

    // TODO Convert widths to use theme spacing/rem.
    export const Properties: ImmutableRecord<Name, DataTableListColumnProperties> = {
        name: {
            key: 'name',
            width: 300,
            label: 'Name',
            sortable: true
        },
        description: {
            key: 'name',
            width: 0,
            label: 'Description',
            sortable: false
        },
        created: {
            key: 'created',
            width: 200,
            label: 'Created',
            sortable: true
        },
        modified: {
            key: 'modified',
            width: 200,
            label: 'Last Modified',
            sortable: true
        }
    };

}
