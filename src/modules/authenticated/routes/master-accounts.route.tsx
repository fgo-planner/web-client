import { Fab, PaperProps, Tooltip } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { PromptDialog } from '../../../components/dialog/prompt-dialog.component';
import { FabContainer } from '../../../components/fab/fab-container.component';
import { MasterAccountAddDialog } from '../../../components/master/account/master-account-add-dialog.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { MasterAccountList as MasterAccountListType, MasterAccountService } from '../../../services/data/master/master-account.service';
import { MasterAccount, ModalOnCloseReason, ReadonlyPartial } from '../../../types';
import { MasterAccountList } from '../components/master/account/list/master-account-list.component';

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

    const [masterAccountList, setMasterAccountList] = useState<MasterAccountListType>();
    const [addAccountDialogOpen, setAddAccountDialogOpen] = useState<boolean>(false);
    const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState<boolean>(false);
    const [deleteAccountTarget, setDeleteAccountTarget] = useState<ReadonlyPartial<MasterAccount>>();

    /*
     * Master account subscriptions
     */
    useEffect(() => {
        const onMasterAccountListUpdatedSubscription = MasterAccountService.onMasterAccountListUpdated
            .subscribe(setMasterAccountList);

        return () => {
            onMasterAccountListUpdatedSubscription.unsubscribe();
        };
    }, []);

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
                MasterAccountService.deleteAccount(deleteAccountTarget?._id!!);
            } catch (e) {
                console.error(e);
            }
        }
        setDeleteAccountTarget(undefined);
        setDeleteAccountDialogOpen(false);
    }, [deleteAccountTarget]);

    return (
        <Fragment>
            <PageTitle>
                Master Accounts
            </PageTitle>
            {!masterAccountList ? <div>Loading...</div> :
                <MasterAccountList 
                    masterAccountList={masterAccountList}
                    onDeleteAccount={handleDeleteAccount}
                />
            }
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
