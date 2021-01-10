import { UserGameAccount } from 'data';
import { Nullable, ReadonlyPartialArray, UserInfo } from 'internal';
import { BehaviorSubject } from 'rxjs';
import { Container as Injectables, Service } from 'typedi';
import { HttpUtils as Http } from 'utils';
import { AuthService } from '../authentication/auth.service';

@Service()
export class UserGameAccountService {
    
    private readonly BaseUrl = `${process.env.REACT_APP_REST_ENDPOINT}/user/game-account`;
 
    /**
     * Key used for storing and retrieving the current game account ID from session
     * storage.
     */
    private readonly CurrentAccountIdKey = 'current-game-account-id';

    private _authService = Injectables.get(AuthService);

    private _currentGameAccount: Nullable<UserGameAccount>;

    /**
     * List of game accounts for the currently logged in user. The elements in the
     * list do not contain the entire game account data; only the _id, name, and
     * friendId fields are present.
     */
    private _gameAccountList: ReadonlyPartialArray<UserGameAccount> = [];

    readonly onCurrentGameAccountChange!: BehaviorSubject<Nullable<UserGameAccount>>;

    readonly onCurrentGameAccountUpdated!: BehaviorSubject<Nullable<UserGameAccount>>;

    readonly onGameAccountListUpdated!: BehaviorSubject<ReadonlyPartialArray<UserGameAccount>>;

    constructor() {
        this.onCurrentGameAccountChange = new BehaviorSubject<Nullable<Nullable<UserGameAccount>>>(null);
        this.onCurrentGameAccountUpdated = new BehaviorSubject<Nullable<UserGameAccount>>(null);
        this.onGameAccountListUpdated = new BehaviorSubject<ReadonlyPartialArray<UserGameAccount>>([]);

        this._authService.onCurrentUserChange.subscribe(this._handleCurrentUserChange.bind(this));
        // TODO Unsubscribe?
    }

    async addAccount(gameAccount: Partial<UserGameAccount>): Promise<UserGameAccount> {
        const account = await Http.put<UserGameAccount>(`${this.BaseUrl}`, gameAccount);
        await this._updateGameAccountList(); // Reload account list
        return account;
    }

    async getAccountsForCurrentUser(): Promise<Partial<UserGameAccount>[]> {
        await this._updateGameAccountList();
        return this._gameAccountList?.map(account => { return { ...account }; });
    }

    async getAccount(id: string): Promise<UserGameAccount> {
        return Http.get<UserGameAccount>(`${this.BaseUrl}/${id}`);
    }

    async updateAccount(gameAccount: Partial<UserGameAccount>): Promise<UserGameAccount> {
        return Http.post<UserGameAccount>(`${this.BaseUrl}`, gameAccount);
    }

    /**
     * Sets the currently selected account. If the provided account ID is empty,
     * then the selected account will be set to null.
     */
    async selectAccount(accountId: Nullable<string>): Promise<Nullable<UserGameAccount>> {
        console.log("selectAccount", accountId)
        if (!accountId) {
            this.onCurrentGameAccountChange.next(this._currentGameAccount = null);
            this._writeCurrentAccountToSessionStorage();
            return null;
        }
        if (this._currentGameAccount?._id === accountId) {
            return this._currentGameAccount;
        }
        // TODO Ensure that the selected account is in the accounts list.
        try {
            this._currentGameAccount = await this.getAccount(accountId);
            this.onCurrentGameAccountChange.next(this._currentGameAccount);
            this._writeCurrentAccountToSessionStorage();
            return this._currentGameAccount;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    /**
     * Auto-selects a game account from the game account list if the currently
     * selected account is either null or not present in the game account list. If
     * the account list is not empty, then the first account in the list is
     * selected. Otherwise, the currently selected account will be set to null.
     */
    private _autoSelectAccount() {
        /*
         * If there are no accounts present, then set the current account to null.
         */
        if (!this._gameAccountList?.length) {
            return this.selectAccount(null);
        }

        /*
         * If an account was already selected, and it is present in the account list,
         * then don't do anything.
         */
        let currentGameAccountId: Nullable<string> = this._currentGameAccount?._id;
        if (currentGameAccountId && this._gameAccountListContainsId(currentGameAccountId)) {
            return;
        }

        /*
         * If there was an account ID session storage, and it is present in the account
         * list, then select it.
         */
        currentGameAccountId = sessionStorage.getItem(this.CurrentAccountIdKey);
        if (currentGameAccountId && this._gameAccountListContainsId(currentGameAccountId)) {
            this.selectAccount(currentGameAccountId);
            return;
        }

        // TODO Use localStorage to retain selected account when opening new windows/tabs.

        /*
         * Default to the first account in the list.
         */
        this.selectAccount(this._gameAccountList[0]._id);
    }

    /**
     * Helper method to check if an account ID exists in the list of accounts.
     */
    private _gameAccountListContainsId(accountId: string) {
        return !!this._gameAccountList.find(account => account._id === accountId);
    }

    /**
     * Helper method for retrieving the account list for the current user and
     * pushing it to the subject.
     */
    private async _updateGameAccountList(): Promise<void> {
        this._gameAccountList = await Http.get<Partial<UserGameAccount>[]>(`${this.BaseUrl}/current-user`);
        this.onGameAccountListUpdated.next(this._gameAccountList);
    }

    private async _handleCurrentUserChange(userInfo: Nullable<UserInfo>): Promise<void> {
        if (!userInfo) {
            this.onCurrentGameAccountChange.next(this._currentGameAccount = null);
            this.onGameAccountListUpdated.next(this._gameAccountList = []);
            return;
        }
        await this._updateGameAccountList();
        this._autoSelectAccount();
    }

    private _writeCurrentAccountToSessionStorage() {
        const accountId = this._currentGameAccount?._id;
        if (!accountId) {
            sessionStorage.removeItem(this.CurrentAccountIdKey);
        } else {
            sessionStorage.setItem(this.CurrentAccountIdKey, accountId);
        }
    }

}
