import { ImmutableRecord } from '@fgo-planner/common-core';
import { DataTableListColumnProperties } from '../../../../../types';

export namespace MasterAccountsRouteAccountListColumn {

    export type Name =
        'name' |
        'friendId' |
        'created' |
        'modified';

    export type Visibility = Partial<Record<Name, boolean>>;

    // TODO Convert widths to use theme spacing/rem.
    export const Properties: ImmutableRecord<Name, DataTableListColumnProperties> = {
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

}
