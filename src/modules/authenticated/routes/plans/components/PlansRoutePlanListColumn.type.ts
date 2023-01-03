import { ImmutableRecord } from '@fgo-planner/common-core';
import { DataTableListColumnProperties } from '../../../../../types';

export type PlansRoutePlanListColumn =
    'name' |
    'description' |
    'created' |
    'modified';

export type PlansRoutePlanListVisibleColumns = Record<PlansRoutePlanListColumn, boolean>;

// TODO Convert widths to use theme spacing/rem.
export const PlansRoutePlanListColumnProperties: ImmutableRecord<PlansRoutePlanListColumn, DataTableListColumnProperties> = {
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
