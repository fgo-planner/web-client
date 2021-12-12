import { UserPreferences } from '@fgo-planner/types';
import { UserInfo } from '../../types/internal';
import { SubscriptionTopic } from './subscription-topic.class';

export class SubscriptionTopics {

    static readonly UserCurrentUserChange = new SubscriptionTopic<UserInfo | null>(null);

    static readonly UserCurrentUserPreferencesChange = new SubscriptionTopic<UserPreferences | null>(null);

}
