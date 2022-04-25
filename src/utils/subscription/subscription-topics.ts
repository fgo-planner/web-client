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

    static readonly BackgroundPlayStatusChange = SubscriptionTopic.instantiate<boolean>();

    static readonly SoundtrackPlayStatusChange = SubscriptionTopic.instantiate<boolean>();

    private constructor() {
        
    }

}

class User {

    /* eslint-disable max-len */

    static readonly CurrentMasterAccountChange = SubscriptionTopic.instantiateWithPreviousAndInitialValue<Nullable<MasterAccount>>(nullSupplier);

    static readonly CurrentUserChange = SubscriptionTopic.instantiateWithPreviousAndInitialValue<Nullable<UserInfo>>(nullSupplier);

    static readonly CurrentUserPreferencesChange = SubscriptionTopic.instantiateWithPreviousAndInitialValue<Nullable<UserPreferences>>(nullSupplier);
    
    static readonly MasterAccountListChange = SubscriptionTopic.instantiateWithPreviousAndInitialValue<Nullable<MasterAccountList>>(nullSupplier);
    
    static readonly Unauthorized = SubscriptionTopic.instantiateWithPreviousValue<HttpResponseError>();
    
    /* eslint-enable max-len */

    private constructor() {
        
    }

}

class UserInterface {

    static readonly AppBarElevatedChange = SubscriptionTopic.instantiateWithPreviousValue<boolean>();

    static readonly LoadingIndicatorDisplayChange = SubscriptionTopic.instantiateWithPreviousValue<boolean>();

    static readonly MetadataChange = SubscriptionTopic.instantiateWithPreviousValue<PageMetadata>();

    static readonly ThemeChange = SubscriptionTopic.instantiateWithPreviousValue<ThemeInfo>();

    private constructor() {
        
    }

}
