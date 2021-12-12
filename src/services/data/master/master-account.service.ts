import { MasterAccount } from '@fgo-planner/types';
import { BehaviorSubject } from 'rxjs';
import { Nullable, ReadonlyPartialArray, UserInfo } from '../../../types/internal';
import { HttpUtils as Http } from '../../../utils/http.utils';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';

export type MasterAccountList = ReadonlyPartialArray<MasterAccount>;

export class MasterAccountService {
    
    private static readonly _BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user/master-account`;
 
    /**
     * Key used for storing and retrieving the current master account ID from
     * session storage.
     */
    private static readonly _CurrentAccountIdKey = 'current-master-account-id';

    private static _currentMasterAccount: Nullable<MasterAccount>;

    /**
     * List of master accounts for the currently logged in user. The elements in
     * the list do not contain the entire master account data; only the _id, name,
     * and friendId fields are present.
     */
    private static _masterAccountList: MasterAccountList = [];

    static readonly onCurrentMasterAccountChange = new BehaviorSubject<Nullable<MasterAccount>>(null);

    static readonly onCurrentMasterAccountUpdated = new BehaviorSubject<Nullable<MasterAccount>>(null);

    static readonly onMasterAccountListUpdated = new BehaviorSubject<MasterAccountList>([]);

    /**
     * Initialization method, simulates a static constructor.
     */
    private static _initialize(): void {
        /*
         * This class is meant to last the lifetime of the application; no need to
         * unsubscribe from subscriptions.
         */
        SubscribablesContainer
            .get(SubscriptionTopics.UserCurrentUserChange)
            .subscribe(this._handleCurrentUserChange.bind(this));
    }

    static async addAccount(masterAccount: Partial<MasterAccount>): Promise<MasterAccount> {
        const account = await Http.put<MasterAccount>(`${this._BaseUrl}`, masterAccount);
        await this._updateMasterAccountList(); // Reload account list
        this._autoSelectAccount();
        return account;
    }

    static async getAccountsForCurrentUser(): Promise<MasterAccountList> {
        await this._updateMasterAccountList();
        return this._masterAccountList?.map(account => { return { ...account }; });
    }

    static async getAccount(id: string): Promise<MasterAccount> {
        return Http.get<MasterAccount>(`${this._BaseUrl}/${id}`);
    }

    static async updateAccount(masterAccount: Partial<MasterAccount>): Promise<MasterAccount> {
        const updated = await Http.post<MasterAccount>(`${this._BaseUrl}`, masterAccount);
        this.onCurrentMasterAccountUpdated.next(this._currentMasterAccount = updated);
        return updated;
    }

    static async deleteAccount(id: string): Promise<MasterAccount> {
        const deleted = await Http.delete<MasterAccount>(`${this._BaseUrl}/${id}`);
        await this._updateMasterAccountList(); // Reload account list
        this._autoSelectAccount();
        return deleted;
    }

    /**
     * Sets the currently selected account. If the provided account ID is empty,
     * then the selected account will be set to null.
     */
    static async selectAccount(accountId: Nullable<string>): Promise<Nullable<MasterAccount>> {
        if (!accountId) {
            this.onCurrentMasterAccountChange.next(this._currentMasterAccount = null);
            this._writeCurrentAccountToSessionStorage();
            return null;
        }
        if (this._currentMasterAccount?._id === accountId) {
            return this._currentMasterAccount;
        }
        // TODO Ensure that the selected account is in the accounts list.
        try {
            this._currentMasterAccount = await this.getAccount(accountId);
            this.onCurrentMasterAccountChange.next(this._currentMasterAccount);
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
    private static _autoSelectAccount(): void {
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
        currentMasterAccountId = sessionStorage.getItem(this._CurrentAccountIdKey);
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
    private static _masterAccountListContainsId(accountId: string): boolean {
        return !!this._masterAccountList.find(account => account._id === accountId);
    }

    /**
     * Helper method for retrieving the account list for the current user and
     * pushing it to the subject.
     */
    private static async _updateMasterAccountList(): Promise<void> {
        this._masterAccountList = await Http.get<Partial<MasterAccount>[]>(`${this._BaseUrl}/current-user`);
        this.onMasterAccountListUpdated.next(this._masterAccountList);
    }

    private static async _handleCurrentUserChange(userInfo: Nullable<UserInfo>): Promise<void> {
        if (!userInfo) {
            this.onCurrentMasterAccountChange.next(this._currentMasterAccount = null);
            this.onMasterAccountListUpdated.next(this._masterAccountList = []);
            return;
        }
        await this._updateMasterAccountList();
        this._autoSelectAccount();
    }

    private static _writeCurrentAccountToSessionStorage(): void {
        const accountId = this._currentMasterAccount?._id;
        if (!accountId) {
            sessionStorage.removeItem(this._CurrentAccountIdKey);
        } else {
            sessionStorage.setItem(this._CurrentAccountIdKey, accountId);
        }
    }

}

// Call the static initialization method.
(MasterAccountService as any)._initialize();
