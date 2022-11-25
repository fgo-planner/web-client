import { User } from '@fgo-planner/data-core';
import { MasterAccountChanges } from '../../../types';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';

export type BasicUser = Pick<User, '_id' | 'username' | 'email'>;

/**
 * Publishes events to the `MasterAccountChangesAvailable` topic to inform
 * subscribers whenever updated master account data is available from the
 * server.
 */
export abstract class MasterAccountChangeListenerService {

    private get _onMasterAccountChangesAvailable() {
        return SubscribablesContainer.get(SubscriptionTopics.User.MasterAccountChangesAvailable);
    }

    protected _publishAvailableChanges(data: MasterAccountChanges) {
        this._onMasterAccountChangesAvailable.next(data);
    }

}
