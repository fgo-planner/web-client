import { ImmutableRecord } from '@fgo-planner/common-core';
import { DataTableListColumnProperties } from '../../../../../types';

export type MasterAccountListColumn =
    'name' |
    'friendId' |
    'created' |
    'modified';

export type MasterAccountListVisibleColumns = Record<MasterAccountListColumn, boolean>;

// TODO Convert widths to use theme spacing/rem.
export const MasterAccountColumnProperties: ImmutableRecord<MasterAccountListColumn, DataTableListColumnProperties> = {
    name: {
        key: 'name',
        width: 256,
        label: 'Name',
        sortable: false
    },
    friendId: {
        key: 'friend-id',
        width: 200,
        label: 'Friend Code',
        sortable: false
    },
    created: {
        key: 'created',
        width: 200,
        label: 'Created',
        sortable: false
    },
    modified: {
        key: 'modified',
        width: 200,
        label: 'Last Modified',
        sortable: false
    }
};
