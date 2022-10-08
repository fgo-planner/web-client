import { ArrayUtils, Nullable, ObjectUtils } from '@fgo-planner/common-core';
import { Inject } from '../../../decorators/dependency-injection/inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { BasicMasterAccounts, MasterAccountChange, MasterAccountChanges } from '../../../types/data';
import { UserInfo } from '../../../types/internal';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';
import { MasterAccountChangeListenerService } from './master-account-change-listener.service';
import { MasterAccountService } from './master-account.service';

const _DefaultPollingInterval = 120000;

/**
 * Implementation of the `MasterAccountChangeListenerService` that uses fixed
 * interval polling to detect changes from server.
 */
@Injectable
export class ScheduledMasterAccountChangeListenerService extends MasterAccountChangeListenerService {

    @Inject(MasterAccountService)
    private readonly _masterAccountService!: MasterAccountService;

    private readonly _pollingInterval: number;

    private _currentUserId?: string;

    private _currentMasterAccountList: BasicMasterAccounts = [];

    private _currentTimeout?: NodeJS.Timeout;

    constructor() {
        super();

        this._pollingInterval = Number(process.env.REACT_APP_MASTER_ACCOUNT_POLLING_INTERVAL) || _DefaultPollingInterval;

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

            SubscribablesContainer
                .get(SubscriptionTopics.User.MasterAccountListChange)
                .subscribe(this._handleMasterAccountListChange.bind(this));
        });
    }

    private _invokePolling(): void {
        clearTimeout(this._currentTimeout);
        this._currentTimeout = setInterval(async () => {
            const data = await this._masterAccountService.getAccountsForCurrentUser();
            const changes = this._findChanges(this._currentMasterAccountList, data);
            if (!Object.keys(changes).length) {
                console.debug('No account changes found');
            } else {
                console.debug('Account changes found', changes);
                this._publishAvailableChanges(changes);
            }
        }, this._pollingInterval);
    }

    private _findChanges(currentAccounts: BasicMasterAccounts, updatedAccounts: BasicMasterAccounts): MasterAccountChanges {
        /**
         * Edge cases
         */
        if (!currentAccounts.length && !updatedAccounts.length) {
            return {};
        } else if (!currentAccounts.length) {
            return ArrayUtils.mapArrayToObject(updatedAccounts, account => account._id, () => 'Created');
        } else if (!updatedAccounts.length) {
            return ArrayUtils.mapArrayToObject(currentAccounts, account => account._id, () => 'Deleted');
        }

        const result = {} as Record<string, MasterAccountChange>;
        /**
         * Currently, there is no way to change the master account order for a user, so
         * any additional or missing IDs will be a result of an account being added or
         * deleted, respectively.
         *
         * O(n^2) time complexity should be fine since the arrays are expected to be
         * small.
         */
        for (let i = 0; i < currentAccounts.length; i++) {
            const currentAccount = currentAccounts[i];
            const accountId = currentAccount._id;
            let found = false;
            for (let j = 0; j < updatedAccounts.length; j++) {
                const updatedAccount = updatedAccounts[j];
                if (accountId === updatedAccount._id) {
                    if (!ObjectUtils.isShallowEquals(currentAccount, updatedAccount)) {
                        result[accountId] = 'Updated';
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                result[accountId] = 'Deleted';
            }
        }

        for (let j = 0; j < updatedAccounts.length; j++) {
            const updatedAccount = updatedAccounts[j];
            const accountId = updatedAccount._id;
            if (result[accountId]) {
                /**
                 * Account was already processed in the previous set of loops, no need to
                 * process again.
                 */
                continue;
            }
            let found = false;
            for (let i = 0; i < currentAccounts.length; i++) {
                const currentAccount = currentAccounts[i];
                if (accountId === currentAccount._id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                result[accountId] = 'Created';
            }
        }

        return result;
    }

    private _handleCurrentUserChange(userInfo: Nullable<UserInfo>): void {
        const userId = userInfo?.id;
        if (this._currentUserId === userId) {
            return;
        }
        this._currentUserId = userId;
        if (userId) {
            this._invokePolling();
        } else {
            clearTimeout(this._currentTimeout);
        }
    }

    private _handleMasterAccountListChange(masterAccountList: Nullable<BasicMasterAccounts>): void {
        this._currentMasterAccountList = masterAccountList || [];
    }

}
