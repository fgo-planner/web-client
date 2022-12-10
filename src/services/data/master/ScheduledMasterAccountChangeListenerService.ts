import { CollectionUtils, Nullable, ObjectUtils } from '@fgo-planner/common-core';
import { isEmpty } from 'lodash-es';
import { Inject } from '../../../decorators/dependency-injection/inject.decorator';
import { Injectable } from '../../../decorators/dependency-injection/injectable.decorator';
import { BasicMasterAccounts, MasterAccountChange, MasterAccountChanges, UserTokenPayload } from '../../../types';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';
import { MasterAccountChangeListenerService } from './MasterAccountChangeListenerService';
import { MasterAccountService } from './master-account.service';

const _DefaultPollingInterval = 30000;

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

    private _currentMasterAccountList: Nullable<BasicMasterAccounts>;

    private _currentTimeout?: NodeJS.Timeout;

    private _windowVisible = true;

    private _pollOnWindowVisible = false;

    constructor() {
        super();

        this._pollingInterval = Number(process.env.REACT_APP_MASTER_ACCOUNT_POLLING_INTERVAL) || _DefaultPollingInterval;

        /**
         * Pauses the polling when the window visibility is hidden, and resumes when 
         */
        window.addEventListener('visibilitychange', (e: Event) => {
            const hidden = (e.target as Document).hidden;
            if (hidden) {
                console.debug('Window is hidden, account change detection paused.');
            } else {
                console.debug('Window is visible, account change detection resumed.');
                if (this._pollOnWindowVisible) {
                    this._invokePolling(true);
                    this._pollOnWindowVisible = false;  // Reset
                }
            }
            this._windowVisible = !hidden;
        });

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

    /**
     * @param immediate Whether the initial poll should be executed immediately. If
     * `false`, the initial poll will happen after the set delay.
     */
    private _invokePolling(immediate = false): void {
        if (immediate) {
            this._findAndPublishChanges();
        }
        clearTimeout(this._currentTimeout);
        this._currentTimeout = setInterval(() => {
            if (!this._windowVisible) {
                this._pollOnWindowVisible = true;  // Poll the next time window is visible
                return;
            }
            this._findAndPublishChanges();
        }, this._pollingInterval);
    }

    private async _findAndPublishChanges(): Promise<void> {
        const data = await this._masterAccountService.getAccountsForCurrentUser();
        if (!this._currentMasterAccountList) {
            return;
        }
        const changes = this._findChanges(this._currentMasterAccountList, data);
        if (isEmpty(changes)) {
            console.debug('No account changes found');
        } else {
            console.debug('Account changes found', changes);
        }
        this._publishAvailableChanges(changes);
    }

    private _findChanges(currentAccounts: BasicMasterAccounts, updatedAccounts: BasicMasterAccounts): MasterAccountChanges {
        /**
         * Edge cases
         */
        if (!currentAccounts.length && !updatedAccounts.length) {
            return {};
        } else if (!currentAccounts.length) {
            return CollectionUtils.mapIterableToObject(updatedAccounts, account => account._id, () => 'Created');
        } else if (!updatedAccounts.length) {
            return CollectionUtils.mapIterableToObject(currentAccounts, account => account._id, () => 'Deleted');
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

    private _handleCurrentUserChange(userToken: Nullable<UserTokenPayload>): void {
        const userId = userToken?.id;
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
        this._currentMasterAccountList = masterAccountList;
        this._publishAvailableChanges({});  // Reset changes
    }

}
