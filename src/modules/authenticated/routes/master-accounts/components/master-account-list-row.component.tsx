import { ImmutableBasicMasterAccount } from '@fgo-planner/data-core';
import React from 'react';
import { DataTableListStaticRow } from '../../../../../components/data-table-list/data-table-list-static-row.component';
import { MasterAccountFriendId } from '../../../../../components/master/account/master-account-friend-id.component';
import { TruncateText } from '../../../../../components/text/truncate-text.component';
import { DateTimeFormatUtils } from '../../../../../utils/date-time-format.utils';
import { MasterAccountListVisibleColumns } from './master-account-list-columns';

type Props = {
    account: ImmutableBasicMasterAccount;
    active: boolean;
    index: number;
    onClick: (e: MouseEvent, account: ImmutableBasicMasterAccount) => void;
    onContextMenu: (e: MouseEvent, account: ImmutableBasicMasterAccount) => void;
    onDoubleClick: (e: MouseEvent, account: ImmutableBasicMasterAccount) => void;
    visibleColumns: Readonly<MasterAccountListVisibleColumns>;
};

export const StyleClassPrefix = 'PlanListRow';

export const MasterAccountListRow = React.memo((props: Props) => {

    const {
        account,
        active,
        index,
        onClick,
        onContextMenu,
        onDoubleClick,
        visibleColumns
    } = props;

    const {
        created,
        modified,
        friendId
    } = visibleColumns;

    const handleClick = useCallback((e: MouseEvent): void => {
        onClick(e, account);
    }, [onClick, account]);

    const handleContextMenu = useCallback((e: MouseEvent): void => {
        onContextMenu(e, account);
    }, [onContextMenu, account]);

    const handleDoubleClick = useCallback((e: MouseEvent): void => {
        onDoubleClick(e, account);
    }, [onDoubleClick, account]);

    return (
        <DataTableListStaticRow
            className={`${StyleClassPrefix}-root`}
            borderBottom
            active={active}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onDoubleClick={handleDoubleClick}
        >
            <TruncateText className={`${StyleClassPrefix}-name`}>
                {account.name || <i>{`Account ${index + 1}`}</i>}
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
