import { Immutable } from '@fgo-planner/common-types';
import { BasicMasterAccount } from '@fgo-planner/data-types';
import React, { MouseEvent, useCallback } from 'react';
import NumberFormat from 'react-number-format';
import { DataTableListStaticRow } from '../../../../../components/data-table-list/data-table-list-static-row.component';
import { TruncateText } from '../../../../../components/text/truncate-text.component';
import { DateTimeFormatUtils } from '../../../../../utils/date-time-format.utils';
import { MasterAccountListVisibleColumns } from './master-account-list-columns';

type Props = {
    account: Immutable<BasicMasterAccount>;
    active: boolean;
    index: number;
    onClick: (e: MouseEvent, account: Immutable<BasicMasterAccount>) => void;
    onContextMenu: (e: MouseEvent, account: Immutable<BasicMasterAccount>) => void;
    onDoubleClick: (e: MouseEvent, account: Immutable<BasicMasterAccount>) => void;
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
                {!account.friendId ? '\u2013' :
                    <NumberFormat
                        thousandSeparator
                        displayType='text'
                        value={account.friendId}
                    />
                }
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
