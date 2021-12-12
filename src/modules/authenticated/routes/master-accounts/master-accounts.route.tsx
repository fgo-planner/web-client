import { MasterAccount } from '@fgo-planner/types';
import { Add as AddIcon } from '@mui/icons-material';
import { Fab, PaperProps, Tooltip } from '@mui/material';
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { PromptDialog } from '../../../../components/dialog/prompt-dialog.component';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPageScrollable } from '../../../../components/layout/layout-page-scrollable.component';
import { LayoutPanelContainer } from '../../../../components/layout/layout-panel-container.component';
import { MasterAccountAddDialog } from '../../../../components/master/account/master-account-add-dialog.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useElevateAppBarOnScroll } from '../../../../hooks/user-interface/use-elevate-app-bar-on-scroll.hook';
import { MasterAccountList as MasterAccountListType, MasterAccountService } from '../../../../services/data/master/master-account.service';
import { ModalOnCloseReason, Nullable, ReadonlyPartial } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../../../utils/subscription/subscription-topic';
import { MasterAccountList } from './master-account-list.component';

const AddAccountDialogPaperProps: PaperProps = {
    style: {
        minWidth: 360
    }
};

const DeleteAccountDialogTitle = 'Delete Account?';

const generateDeleteAccountDialogPrompt = (masterAccount: ReadonlyPartial<MasterAccount>): string => {
    if (!masterAccount) {
        return '';
    }
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

export const MasterAccountsRoute = React.memo(() => {

    const masterAccountService = useInjectable(MasterAccountService);

    const [masterAccountList, setMasterAccountList] = useState<Nullable<MasterAccountListType>>();
    const [addAccountDialogOpen, setAddAccountDialogOpen] = useState<boolean>(false);
    const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState<boolean>(false);
    const [deleteAccountTarget, setDeleteAccountTarget] = useState<ReadonlyPartial<MasterAccount>>();

    /*
     * Master account subscriptions
     */
    useEffect(() => {
        const onMasterAccountListUpdateSubscription = SubscribablesContainer
            .get(SubscriptionTopic.User_MasterAccountListUpdate)
            .subscribe(setMasterAccountList);

        return () => {
            onMasterAccountListUpdateSubscription.unsubscribe();
        };
    }, []);

    const scrollContainer = useElevateAppBarOnScroll();

    const deleteAccountDialogPrompt = useMemo(() => {
        if (!deleteAccountTarget) {
            return '';
        }
        return generateDeleteAccountDialogPrompt(deleteAccountTarget);
    }, [deleteAccountTarget]);

    const openAddAccountDialog = useCallback((): void => {
        setAddAccountDialogOpen(true);
    }, []);

    const handleAddAccountDialogClose = useCallback((): void => {
        setAddAccountDialogOpen(false);
    }, []);

    const handleDeleteAccount = useCallback((masterAccount: ReadonlyPartial<MasterAccount>): void => {
        setDeleteAccountTarget(masterAccount);
        setDeleteAccountDialogOpen(true);
    }, []);

    const handleDeleteAccountDialogClose = useCallback((event: any, reason: ModalOnCloseReason): void => {
        if (reason === 'submit') {
            try {
                masterAccountService.deleteAccount(deleteAccountTarget?._id!!);
            } catch (e) {
                console.error(e);
            }
        }
        setDeleteAccountTarget(undefined);
        setDeleteAccountDialogOpen(false);
    }, [deleteAccountTarget, masterAccountService]);

    return (
        <Fragment>
            <LayoutPageScrollable scrollContainerRef={scrollContainer}>
                <PageTitle>
                    Master Accounts
                </PageTitle>
                <LayoutPanelContainer className="p-4">
                    {!masterAccountList ? <div>Loading...</div> :
                        <MasterAccountList
                            masterAccountList={masterAccountList}
                            onDeleteAccount={handleDeleteAccount}
                        />
                    }
                </LayoutPanelContainer>
                <div className="py-10" />
            </LayoutPageScrollable>
            <MasterAccountAddDialog
                PaperProps={AddAccountDialogPaperProps}
                open={addAccountDialogOpen}
                onClose={handleAddAccountDialogClose}
            />
            <PromptDialog
                open={deleteAccountDialogOpen}
                title={DeleteAccountDialogTitle}
                prompt={deleteAccountDialogPrompt}
                cancelButtonColor="secondary"
                confirmButtonColor="primary"
                confirmButtonLabel="Delete"
                onClose={handleDeleteAccountDialogClose}
            />
            <FabContainer>
                <Tooltip key="add" title="Add master account">
                    <Fab
                        color="primary"
                        onClick={openAddAccountDialog}
                        children={<AddIcon />}
                    />
                </Tooltip>
            </FabContainer>
        </Fragment>
    );

});
