import { MasterAccount, UserPreferences } from '@fgo-planner/types';
import { MasterAccountList } from '../../types/data';
import { HttpResponseError, Nullable, PageMetadata, ThemeInfo, UserInfo } from '../../types/internal';
import { nullSupplier } from '../function.utils';
import { SubscriptionTopic } from './subscription-topic.class';

export class SubscriptionTopics {

    static get Audio() {
        return Audio;
    }

    static get User() {
        return User;
    }

    static get UserInterface() {
        return UserInterface;
    }

    private constructor() {
        
    }

}

class Audio {

    static readonly BackgroundPlayStatusChange = SubscriptionTopic.forSubject<boolean>();

    static readonly SoundtrackPlayStatusChange = SubscriptionTopic.forSubject<boolean>();

    private constructor() {
        
    }

}

class User {

    /* eslint-disable max-len */

    static readonly CurrentMasterAccountChange = SubscriptionTopic.forBehaviorSubject<Nullable<MasterAccount>>(nullSupplier);

    static readonly CurrentUserChange = SubscriptionTopic.forBehaviorSubject<Nullable<UserInfo>>(nullSupplier);

    static readonly CurrentUserPreferencesChange = SubscriptionTopic.forBehaviorSubject<Nullable<UserPreferences>>(nullSupplier);
    
    static readonly MasterAccountListChange = SubscriptionTopic.forBehaviorSubject<Nullable<MasterAccountList>>(nullSupplier);
    
    static readonly Unauthorized = SubscriptionTopic.forReplaySubject<HttpResponseError>();
    
    /* eslint-enable max-len */

    private constructor() {
        
    }

}

class UserInterface {

    static readonly AppBarElevatedChange = SubscriptionTopic.forReplaySubject<boolean>();

    static readonly LoadingIndicatorDisplayChange = SubscriptionTopic.forReplaySubject<boolean>();

    static readonly MetadataChange = SubscriptionTopic.forReplaySubject<PageMetadata>();

    static readonly ThemeChange = SubscriptionTopic.forReplaySubject<ThemeInfo>();

    private constructor() {
        
    }

}
