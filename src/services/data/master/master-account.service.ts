import { MasterAccount } from 'data';
import { Nullable, ReadonlyPartialArray, UserInfo } from 'internal';
import { BehaviorSubject } from 'rxjs';
import { Container as Injectables, Service } from 'typedi';
import { HttpUtils as Http } from 'utils';
import { AuthService } from '../../authentication/auth.service';

@Service()
export class MasterAccountService {
    
    private readonly BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user/master-account`;
 
    /**
     * Key used for storing and retrieving the current master account ID from
     * session storage.
     */
    private readonly CurrentAccountIdKey = 'current-master-account-id';

    private _authService = Injectables.get(AuthService);

    private _currentMasterAccount: Nullable<MasterAccount>;

    /**
     * List of master accounts for the currently logged in user. The elements in
     * the list do not contain the entire master account data; only the _id, name,
     * and friendId fields are present.
     */
    private _masterAccountList: ReadonlyPartialArray<MasterAccount> = [];

    readonly onCurrentMasterAccountChange!: BehaviorSubject<Nullable<MasterAccount>>;

    readonly onCurrentMasterAccountUpdated!: BehaviorSubject<Nullable<MasterAccount>>;

    readonly onMasterAccountListUpdated!: BehaviorSubject<ReadonlyPartialArray<MasterAccount>>;

    constructor() {
        this.onCurrentMasterAccountChange = new BehaviorSubject<Nullable<MasterAccount>>(null);
        this.onCurrentMasterAccountUpdated = new BehaviorSubject<Nullable<MasterAccount>>(null);
        this.onMasterAccountListUpdated = new BehaviorSubject<ReadonlyPartialArray<MasterAccount>>([]);

        this._authService.onCurrentUserChange.subscribe(this._handleCurrentUserChange.bind(this));
        // TODO Unsubscribe?
    }

    async addAccount(masterAccount: Partial<MasterAccount>): Promise<MasterAccount> {
        const account = await Http.put<MasterAccount>(`${this.BaseUrl}`, masterAccount);
        await this._updateMasterAccountList(); // Reload account list
        this._autoSelectAccount();
        return account;
    }

    async getAccountsForCurrentUser(): Promise<Partial<MasterAccount>[]> {
        await this._updateMasterAccountList();
        return this._masterAccountList?.map(account => { return { ...account }; });
    }

    async getAccount(id: string): Promise<MasterAccount> {
        return Http.get<MasterAccount>(`${this.BaseUrl}/${id}`);
    }

    async updateAccount(masterAccount: Partial<MasterAccount>): Promise<MasterAccount> {
        const updated = await Http.post<MasterAccount>(`${this.BaseUrl}`, masterAccount);
        this.onCurrentMasterAccountUpdated.next(this._currentMasterAccount = updated);
        return updated;
    }

    /**
     * Sets the currently selected account. If the provided account ID is empty,
     * then the selected account will be set to null.
     */
    async selectAccount(accountId: Nullable<string>): Promise<Nullable<MasterAccount>> {
        console.log("selectAccount", accountId)
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
    private _autoSelectAccount() {
        /*
         * If there are no accounts present, then set the current account to null.
         */
        if (!this._masterAccountList?.length) {
            return this.selectAccount(null);
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
        currentMasterAccountId = sessionStorage.getItem(this.CurrentAccountIdKey);
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
    private _masterAccountListContainsId(accountId: string) {
        return !!this._masterAccountList.find(account => account._id === accountId);
    }

    /**
     * Helper method for retrieving the account list for the current user and
     * pushing it to the subject.
     */
    private async _updateMasterAccountList(): Promise<void> {
        this._masterAccountList = await Http.get<Partial<MasterAccount>[]>(`${this.BaseUrl}/current-user`);
        this.onMasterAccountListUpdated.next(this._masterAccountList);
    }

    private async _handleCurrentUserChange(userInfo: Nullable<UserInfo>): Promise<void> {
        if (!userInfo) {
            this.onCurrentMasterAccountChange.next(this._currentMasterAccount = null);
            this.onMasterAccountListUpdated.next(this._masterAccountList = []);
            return;
        }
        await this._updateMasterAccountList();
        this._autoSelectAccount();
    }

    private _writeCurrentAccountToSessionStorage() {
        const accountId = this._currentMasterAccount?._id;
        if (!accountId) {
            sessionStorage.removeItem(this.CurrentAccountIdKey);
        } else {
            sessionStorage.setItem(this.CurrentAccountIdKey, accountId);
        }
    }

}
