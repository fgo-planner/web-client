import { Immutable } from '@fgo-planner/common-core';
import { BasicMasterAccount } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode } from 'react';
import { BasicMasterAccounts } from '../../../../../types';
import { MasterAccountsRouteAccountListColumn } from './MasterAccountsRouteAccountListColumn';
import { MasterAccountsRouteAccountListHeader } from './MasterAccountsRouteAccountListHeader';
import { MasterAccountsRouteAccountListRow, StyleClassPrefix as MasterAccountsRouteAccountListRowStyleClassPrefix } from './MasterAccountsRouteAccountListRow';

type Props = {
    masterAccountList: BasicMasterAccounts;
    visibleColumns: Readonly<MasterAccountsRouteAccountListColumn.Visibility>;
};

export const StyleClassPrefix = 'MasterAccountsRouteAccountList';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette
    } = theme as Theme;

    return {
        backgroundColor: palette.background.paper,
        flex: 1,
        height: '100%',
        overflow: 'auto',
        [`& .${StyleClassPrefix}-list-container`]: {
            display: 'flex',
            flexDirection: 'column',
            minWidth: 'fit-content',
            [`& .${MasterAccountsRouteAccountListRowStyleClassPrefix}-root`]: {
                height: 52,
                px: 4,
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                '>div': {
                    boxSizing: 'border-box',
                    px: 2,
                    textAlign: 'center'
                },
                [`& .${MasterAccountsRouteAccountListRowStyleClassPrefix}-name`]: {
                    width: MasterAccountsRouteAccountListColumn.Properties.name.width,
                    textAlign: 'left',
                    fontWeight: 500,
                    '& a': {
                        color: palette.primary.main,
                        textDecoration: 'none'
                    },
                    [breakpoints.down('sm')]: {
                        flex: 1,
                        width: 'initial !important',
                        px: 0
                    }
                },
                [`& .${MasterAccountsRouteAccountListRowStyleClassPrefix}-friend-id`]: {
                    width: MasterAccountsRouteAccountListColumn.Properties.friendId.width,
                },
                [`& .${MasterAccountsRouteAccountListRowStyleClassPrefix}-created`]: {
                    width: MasterAccountsRouteAccountListColumn.Properties.created.width,
                },
                [`& .${MasterAccountsRouteAccountListRowStyleClassPrefix}-modified`]: {
                    width: MasterAccountsRouteAccountListColumn.Properties.modified.width,
                },
            },
            [breakpoints.down('sm')]: {
                minWidth: 0
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterAccountsRouteAccountList = React.memo((props: Props) => {

    const {
        masterAccountList,
        visibleColumns
    } = props;

    const renderAccountRow = (account: Immutable<BasicMasterAccount>, index: number): ReactNode => {
        return (
            <MasterAccountsRouteAccountListRow
                key={account._id}
                index={index}
                account={account}
                visibleColumns={visibleColumns}
            />
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-list-container`}>
                <MasterAccountsRouteAccountListHeader visibleColumns={visibleColumns} />
                {masterAccountList.map(renderAccountRow)}
            </div>
        </Box>
    );

});
