import { Nullable } from '@fgo-planner/common-core';
import { BasicMasterAccount } from '@fgo-planner/data-core';
import { Box, Button, Icon, IconButton, PaperProps, Theme } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MasterAccountAddDialog } from '../../../../components/master/account/MasterAccountAddDialog';
import { PageTitle } from '../../../../components/text/PageTitle';
import { useInjectable } from '../../../../hooks/dependency-injection/useInjectable';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/useActiveBreakpoints';
import { MasterAccountService } from '../../../../services/data/master/MasterAccountService';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { BasicMasterAccounts, ModalOnCloseReason } from '../../../../types';
import { SubscribablesContainer } from '../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../utils/subscription/SubscriptionTopics';
import { MasterAccountsRouteAccountList } from './components/MasterAccountsRouteAccountList';
import { MasterAccountsRouteAccountListColumn } from './components/MasterAccountsRouteAccountListColumn';

const AddAccountDialogPaperProps: PaperProps = {
    style: {
        minWidth: 360
    }
};

const StyleClassPrefix = 'MasterAccountsRoute';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette,
        spacing
    } = theme as Theme;

    return {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        [`& .${StyleClassPrefix}-upper-layout-container`]: {
            '&>div': {
                display: 'flex',
                alignItems: 'center',
                minHeight: '4rem',
                height: '4rem',
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                borderBottomColor: palette.divider
            },
            [`& .${StyleClassPrefix}-title-row`]: {
                justifyContent: 'space-between',
                pr: 4,
                [`& .${StyleClassPrefix}-title`]: {
                    pb: 4
                },
                [breakpoints.down('sm')]: {
                    pr: 3
                }
            },
            [`& .${StyleClassPrefix}-filter-controls`]: {
                '& .MuiTextField-root': {
                    width: spacing(64),  // 256px
                    ml: 14,
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: palette.background.paper
                    },
                    [breakpoints.down('sm')]: {
                        width: spacing(48),  // 192px
                        ml: 4
                    }
                }
            }
        },
        [`& .${StyleClassPrefix}-lower-layout-container`]: {
            display: 'flex',
            height: '100%',
            overflow: 'hidden',
            [`& .${StyleClassPrefix}-list-container`]: {
                flex: 1,
                overflow: 'hidden'
            },
            [breakpoints.down('sm')]: {
                flexDirection: 'column',
                [`& .${StyleClassPrefix}-main-content`]: {
                    width: '100%',
                    height: `calc(100% - ${spacing(ThemeConstants.NavigationRailSizeScale)})`
                }
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

// TODO Add context menus
// TODO Modify add dialog to be able to edit

export const MasterAccountsRoute = React.memo(() => {

    const { sm } = useActiveBreakpoints();

    const masterAccountService = useInjectable(MasterAccountService);

    const [masterAccountList, setMasterAccountList] = useState<Nullable<BasicMasterAccounts>>();

    const [addAccountDialogOpen, setAddAccountDialogOpen] = useState<boolean>(false);
    const [addAccountDialogError, setAddAccountDialogError] = useState<string>();

    /**
     * Master account list change subscription.
     */
    useEffect(() => {
        const onMasterAccountListChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.MasterAccountListChange)
            .subscribe(setMasterAccountList);

        return () => onMasterAccountListChangeSubscription.unsubscribe();
    }, []);

    const visibleColumns = useMemo((): MasterAccountsRouteAccountListColumn.Visibility => ({
        name: true,
        friendId: true,
        created: sm,
        modified: sm
    }), [sm]);

    const openAddAccountDialog = useCallback((): void => {
        setAddAccountDialogOpen(true);
    }, []);

    // eslint-disable-next-line max-len
    const handleAddAccountDialogClose = useCallback(async (_event: any, _reason: ModalOnCloseReason, data?: Partial<BasicMasterAccount>): Promise<void> => {
        if (data) {
            try {
                await masterAccountService.addAccount(data);
            } catch (e: any) {
                setAddAccountDialogError(e.message || String(e));
                return;
            }
        }
        setAddAccountDialogOpen(false);
        setAddAccountDialogError(undefined);
    }, [masterAccountService]);

    return <>
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-upper-layout-container`}>
                <div className={`${StyleClassPrefix}-title-row`}>
                    <PageTitle className={`${StyleClassPrefix}-title`}>
                        Master Accounts
                    </PageTitle>
                    {sm ?
                        <Button variant='contained' onClick={openAddAccountDialog}>
                            Add Account
                        </Button> :
                        <IconButton color='primary' onClick={openAddAccountDialog}>
                            <Icon>group_add</Icon>
                        </IconButton>
                    }
                </div>
            </div>
            <div className={`${StyleClassPrefix}-lower-layout-container`}>
                <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                    {masterAccountList &&
                        <MasterAccountsRouteAccountList
                            masterAccountList={masterAccountList}
                            visibleColumns={visibleColumns}
                        />
                    }
                </div>
            </div>
        </Box>
        <MasterAccountAddDialog
            PaperProps={AddAccountDialogPaperProps}
            open={addAccountDialogOpen}
            errorMessage={addAccountDialogError}
            onClose={handleAddAccountDialogClose}
        />
    </>;

});
