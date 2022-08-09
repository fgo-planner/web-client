import { BasicMasterAccount, MasterAccount } from '@fgo-planner/types';
import { GroupAdd as GroupAddIcon } from '@mui/icons-material';
import { Box, Button, IconButton, PaperProps, Theme } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { PromptDialog } from '../../../../components/dialog/prompt-dialog.component';
import { MasterAccountAddDialog } from '../../../../components/master/account/master-account-add-dialog.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { BasicMasterAccounts } from '../../../../types/data';
import { Immutable, ModalOnCloseReason, Nullable } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { MasterAccountListVisibleColumns } from './components/master-account-list-columns';
import { MasterAccountList } from './components/master-account-list.component';
import { MasterAccountsNavigationRail } from './components/master-accounts-navigation-rail.component';

const AddAccountDialogPaperProps: PaperProps = {
    style: {
        minWidth: 360
    }
};

const DeleteAccountDialogTitle = 'Delete Account?';

const generateDeleteAccountDialogPrompt = (masterAccount: Immutable<BasicMasterAccount>): string => {
    const { name, friendId } = masterAccount;
    let prompt = 'Are you sure you want to delete the account';
    if (name) {
        prompt += ` '${name}'`;
    }
    if (friendId) {
        prompt += ` with friend ID ${friendId}`;
        // TODO Format friend ID with thousands separator
    }
    return prompt + '?';
};

const StyleClassPrefix = 'MasterAccounts';

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

    const [selectedAccount, setSelectedAccount] = useState<Immutable<BasicMasterAccount>>();

    const [addAccountDialogOpen, setAddAccountDialogOpen] = useState<boolean>(false);
    const [addAccountDialogError, setAddAccountDialogError] = useState<string>();

    /**
     * The prompt for the delete account dialog. The dialog will be set to an `open`
     * state if this is not `undefined`.
     */
    const [deleteAccountDialogPrompt, setDeleteAccountDialogPrompt] = useState<string>();

    /**
     * Subscription handler for the `MasterAccountListChange` topic.
     *
     * Sets the `masterAccountList` state and updates the `selectedAccount` object
     * reference if needed.
     */
    const updateMasterAccountList = useCallback((masterAccountList: Nullable<BasicMasterAccounts>): void => {
        setSelectedAccount(selectedAccount => {
            if (!selectedAccount || !masterAccountList?.length) {
                return undefined;
            }
            return masterAccountList.find(account => selectedAccount._id === account._id);
        });
        setMasterAccountList(masterAccountList);
    }, []);

    /**
     * Master account list change subscription.
     */
    useEffect(() => {
        const onMasterAccountListChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.MasterAccountListChange)
            .subscribe(updateMasterAccountList);

        return () => onMasterAccountListChangeSubscription.unsubscribe();
    }, [updateMasterAccountList]);

    const visibleColumns = useMemo((): MasterAccountListVisibleColumns => ({
        name: true,
        friendId: true,
        created: sm,
        modified: sm
    }), [sm]);

    const openAddAccountDialog = useCallback((): void => {
        setAddAccountDialogOpen(true);
    }, []);

    // eslint-disable-next-line max-len
    const handleAddAccountDialogClose = useCallback(async (_: any, __: ModalOnCloseReason, data?: Partial<MasterAccount>): Promise<void> => {
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

    const openDeleteAccountDialog = useCallback((): void => {
        if (!selectedAccount) {
            return;
        }
        const prompt = generateDeleteAccountDialogPrompt(selectedAccount);
        setDeleteAccountDialogPrompt(prompt);
    }, [selectedAccount]);

    const handleDeleteAccountDialogClose = useCallback((_: any, reason: ModalOnCloseReason): void => {
        if (reason === 'submit') {
            if (!selectedAccount) {
                return;
            }
            try {
                masterAccountService.deleteAccount(selectedAccount._id);
            } catch (e) {
                console.error(e);
            }
        }
        setDeleteAccountDialogPrompt(undefined);
    }, [masterAccountService, selectedAccount]);
    

    //#region Account list event handlers

    const handleRowClick = useCallback((e: MouseEvent, account: Immutable<BasicMasterAccount>): void => {
        if (e.type === 'contextmenu') {
            // TODO Open context menu
            return;
        }
        setSelectedAccount(account);
    }, []);

    const handleRowDoubleClick = useCallback((): void => {
        // TODO Open dialog for editing
    }, []);

    //#endregion


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
                            <GroupAddIcon />
                        </IconButton>
                    }
                </div>
            </div>
            <div className={`${StyleClassPrefix}-lower-layout-container`}>
                <MasterAccountsNavigationRail
                    layout={sm ? 'column' : 'row'}
                    hasSelection={!!selectedAccount}
                    onAddMasterAccount={openAddAccountDialog}
                    onDeleteSelectedMasterAccount={openDeleteAccountDialog}
                />
                <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                    {masterAccountList &&
                        <MasterAccountList
                            masterAccountList={masterAccountList}
                            visibleColumns={visibleColumns}
                            selectedId={selectedAccount?._id}
                            onRowClick={handleRowClick}
                            onRowDoubleClick={handleRowDoubleClick}
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
        <PromptDialog
            open={!!deleteAccountDialogPrompt}
            title={DeleteAccountDialogTitle}
            prompt={deleteAccountDialogPrompt}
            cancelButtonColor='secondary'
            confirmButtonColor='primary'
            confirmButtonLabel='Delete'
            onClose={handleDeleteAccountDialogClose}
        />
    </>;

});
