import { Nullable } from '@fgo-planner/common-core';
import { MasterAccount, MasterAccountUpdate } from '@fgo-planner/data-core';
import { Inject } from '../../../decorators/dependency-injection/inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { BasicMasterAccounts } from '../../../types/data';
import { UserInfo } from '../../../types/internal';
import { HttpUtils as Http, HttpUtils } from '../../../utils/http.utils';
import { StorageKeys } from '../../../utils/storage/storage-keys';
import { StorageUtils } from '../../../utils/storage/storage.utils';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';
import { UserInterfaceService } from '../../user-interface/user-interface.service';

@Injectable
export class MasterAccountService {

    private readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user/master-account`;

    @Inject(UserInterfaceService)
    private readonly _userInterfaceService!: UserInterfaceService;

    private _currentMasterAccount: Nullable<MasterAccount>;

    /**
     * List of master accounts for the currently logged in user. The elements in
     * the list do not contain the entire master account data; only the _id, name,
     * and friendId fields are present.
     */
    private _masterAccountList: Nullable<BasicMasterAccounts>;

    private get _onCurrentMasterAccountChange() {
        return SubscribablesContainer.get(SubscriptionTopics.User.CurrentMasterAccountChange);
    }

    private get _onMasterAccountListChange() {
        return SubscribablesContainer.get(SubscriptionTopics.User.MasterAccountListChange);
    }

    constructor() {
        /**
         * Set timeout before subscribing to let the dependencies inject first.
         *
         * This class is meant to last the lifetime of the application; no need to
         * unsubscribe from subscriptions.
         */
        setTimeout(() => {
            SubscribablesContainer
                .get(SubscriptionTopics.User.CurrentUserChange)
                .subscribe(this._handleCurrentUserChange.bind(this));
        });
    }

    async addAccount(masterAccount: Partial<MasterAccount>): Promise<MasterAccount> {
        const loadingIndicatorId = this._userInterfaceService.invokeLoadingIndicator();
        let account: MasterAccount;
        try {
            account = await Http.put<MasterAccount>(`${this._BaseUrl}`, masterAccount, Http.stringTimestampsToDate);
            await this._updateMasterAccountList(); // Reload account list
            this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
        } catch (e: any) {
            this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
            throw e;
        }
        this._autoSelectAccount();
        return account;
    }

    async getAccountsForCurrentUser(): Promise<BasicMasterAccounts> {
        /**
         * We do not want to invoke loading indicator here since this will periodically
         * be called by the `FixedIntervalMasterAccountChangeListenerService` in the
         * background.
         */
        return Http.get<BasicMasterAccounts>(`${this._BaseUrl}/current-user`, HttpUtils.stringTimestampsToDate);
    }

    async getAccount(id: string): Promise<MasterAccount> {
        const loadingIndicatorId = this._userInterfaceService.invokeLoadingIndicator();
        let account: MasterAccount;
        try {
            account = await Http.get<MasterAccount>(`${this._BaseUrl}/${id}`, Http.stringTimestampsToDate);
            this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
        } catch (e: any) {
            this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
            throw e;
        }
        return account;
    }

    async updateAccount(masterAccount: MasterAccountUpdate): Promise<MasterAccount> {
        const loadingIndicatorId = this._userInterfaceService.invokeLoadingIndicator();
        let updated: MasterAccount;
        try {
            updated = await Http.post<MasterAccount>(`${this._BaseUrl}`, masterAccount, Http.stringTimestampsToDate);
            this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
        } catch (e: any) {
            this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
            throw e;
        }
        this._onCurrentMasterAccountChange.next(this._currentMasterAccount = updated);
        return updated;
    }

    async deleteAccount(id: string): Promise<boolean> {
        const loadingIndicatorId = this._userInterfaceService.invokeLoadingIndicator();
        let deleted: boolean;
        try {
            deleted = await Http.delete<boolean>(`${this._BaseUrl}/${id}`);
            await this._updateMasterAccountList(); // Reload account list
            this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
        } catch (e: any) {
            this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
            throw e;
        }
        this._autoSelectAccount();
        return deleted;
    }

    /**
     * Sets the currently selected account. If the provided account ID is empty,
     * then the selected account will be set to null.
     */
    async selectAccount(accountId: Nullable<string>): Promise<Nullable<MasterAccount>> {
        if (!accountId) {
            this._onCurrentMasterAccountChange.next(this._currentMasterAccount = null);
            this._writeCurrentAccountToSessionStorage();
            return null;
        }
        if (this._currentMasterAccount?._id === accountId) {
            return this._currentMasterAccount;
        }
        // TODO Ensure that the selected account is in the accounts list.
        try {
            this._currentMasterAccount = await this.getAccount(accountId);
            this._onCurrentMasterAccountChange.next(this._currentMasterAccount);
            this._writeCurrentAccountToSessionStorage();
            return this._currentMasterAccount;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    /**
     * Auto-selects a master account from the master account list if the currently
     * selected account is either null or not present in the master account list.
     * If the account list is not empty, then the first account in the list is
     * selected. Otherwise, the currently selected account will be set to null.
     */
    private _autoSelectAccount(): void {
        /*
         * If there are no accounts present, then set the current account to null.
         */
        if (!this._masterAccountList?.length) {
            this.selectAccount(null);
            return;
        }

        /*
         * If an account was already selected, and it is present in the account list,
         * then don't do anything.
         */
        let currentMasterAccountId: Nullable<string> = this._currentMasterAccount?._id;
        if (currentMasterAccountId && this._masterAccountListContainsId(currentMasterAccountId)) {
            return;
        }

        /*
         * If there was an account ID session storage, and it is present in the account
         * list, then select it.
         */
        currentMasterAccountId = StorageUtils.getItemAsString(StorageKeys.User.CurrentMasterAccountId);
        if (currentMasterAccountId && this._masterAccountListContainsId(currentMasterAccountId)) {
            this.selectAccount(currentMasterAccountId);
            return;
        }

        // TODO Use localStorage to retain selected account when opening new windows/tabs.

        /*
         * Default to the first account in the list.
         */
        this.selectAccount(this._masterAccountList[0]._id);
    }

    /**
     * Helper method to check if an account ID exists in the list of accounts.
     */
    private _masterAccountListContainsId(accountId: string): boolean {
        if (!this._masterAccountList?.length) {
            return false;
        }
        return !!this._masterAccountList.find(account => account._id === accountId);
    }

    /**
     * Helper method for retrieving the account list for the current user and
     * pushing it to the subject.
     */
    private async _updateMasterAccountList(): Promise<void> {
        const loadingIndicatorId = this._userInterfaceService.invokeLoadingIndicator();
        try {
            this._masterAccountList = await this.getAccountsForCurrentUser();
            this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
        } catch (e: any) {
            this._userInterfaceService.waiveLoadingIndicator(loadingIndicatorId);
            throw e;
        }
        this._onMasterAccountListChange.next(this._masterAccountList);
    }

    private async _handleCurrentUserChange(userInfo: Nullable<UserInfo>): Promise<void> {
        if (!userInfo) {
            this._onCurrentMasterAccountChange.next(this._currentMasterAccount = null);
            this._onMasterAccountListChange.next(this._masterAccountList = null);
            return;
        }
        await this._updateMasterAccountList();
        this._autoSelectAccount();
    }

    private _writeCurrentAccountToSessionStorage(): void {
        const accountId = this._currentMasterAccount?._id;
        StorageUtils.setItem(StorageKeys.User.CurrentMasterAccountId, accountId);
    }

}
