import { ImmutableRecord } from '@fgo-planner/common-core';
import { ColumnProperties } from '../../../../../types/internal';

export type PlanListColumn =
    'name' |
    'description' |
    'created' |
    'modified';

export type PlanListVisibleColumns = Record<PlanListColumn, boolean>;

// TODO Convert widths to use theme spacing/rem.
export const PlanColumnProperties = {
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
} as ImmutableRecord<PlanListColumn | 'label', ColumnProperties>;
