import { ImmutableBasicMasterAccount } from '@fgo-planner/data-core';
import React from 'react';
import { Link } from 'react-router-dom';
import { DataTableListStaticRow } from '../../../../../components/data-table-list/data-table-list-static-row.component';
import { MasterAccountFriendId } from '../../../../../components/master/account/master-account-friend-id.component';
import { TruncateText } from '../../../../../components/text/truncate-text.component';
import { DateTimeFormatUtils } from '../../../../../utils/format/date-time-format.utils';
import { MasterAccountListVisibleColumns } from './master-account-list-columns';

type Props = {
    account: ImmutableBasicMasterAccount;
    index: number;
    visibleColumns: Readonly<MasterAccountListVisibleColumns>;
};

export const StyleClassPrefix = 'MasterAccountListRow';

export const MasterAccountListRow = React.memo((props: Props) => {

    const {
        account,
        index,
        visibleColumns
    } = props;

    const {
        created,
        modified,
        friendId
    } = visibleColumns;

    return (
        <DataTableListStaticRow className={`${StyleClassPrefix}-root`} borderBottom>
            <TruncateText className={`${StyleClassPrefix}-name`}>
                <Link to={`../master/settings?account-id=${account._id}`}>
                    {account.name || <i>{`Account ${index + 1}`}</i>}
                </Link>
            </TruncateText>
            {friendId && <TruncateText className={`${StyleClassPrefix}-friend-id`}>
                <MasterAccountFriendId
                    masterAccount={account}
                    defaultValue={'\u2013'}
                />
            </TruncateText>}
            {created && <div className={`${StyleClassPrefix}-created`}>
                {DateTimeFormatUtils.formatForDataTable(account.createdAt)}
            </div>}
            {modified && <div className={`${StyleClassPrefix}-modified`}>
                {DateTimeFormatUtils.formatForDataTable(account.updatedAt)}
            </div>}
        </DataTableListStaticRow>
    );

});
