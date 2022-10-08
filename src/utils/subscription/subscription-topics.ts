import { Nullable } from '@fgo-planner/common-core';
import { MasterAccount, UserPreferences } from '@fgo-planner/data-core';
import { BasicMasterAccounts, MasterAccountChanges } from '../../types/data';
import { HttpResponseError, PageMetadata, ThemeInfo, UserInfo } from '../../types/internal';
import { Functions } from '../functions';
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

    static readonly CurrentMasterAccountChange = SubscriptionTopic.forBehaviorSubject<Nullable<MasterAccount>>(Functions.nullSupplier);

    static readonly CurrentUserChange = SubscriptionTopic.forBehaviorSubject<Nullable<UserInfo>>(Functions.nullSupplier);

    // TODO Wrap UserPreferences with Immutable<>
    static readonly CurrentUserPreferencesChange = SubscriptionTopic.forBehaviorSubject<Nullable<UserPreferences>>(Functions.nullSupplier);
    
    static readonly MasterAccountListChange = SubscriptionTopic.forBehaviorSubject<Nullable<BasicMasterAccounts>>(Functions.nullSupplier);

    static readonly MasterAccountChangesAvailable = SubscriptionTopic.forReplaySubject<MasterAccountChanges>();
    
    static readonly Unauthorized = SubscriptionTopic.forReplaySubject<HttpResponseError>();
    
    /* eslint-enable max-len */

    private constructor() {
        
    }

}

class UserInterface {

    static readonly AppBarElevatedChange = SubscriptionTopic.forReplaySubject<boolean>();

    static readonly LoadingIndicatorActiveChange = SubscriptionTopic.forReplaySubject<boolean>();

    static readonly LoginDialogOpenChange = SubscriptionTopic.forReplaySubject<boolean>();

    static readonly MetadataChange = SubscriptionTopic.forReplaySubject<PageMetadata>();

    // static readonly NavigationDrawerContentChange = SubscriptionTopic.forReplaySubject<Nullable<NavigationDrawerContent>>();
    
    static readonly NavigationDrawerOpenChange = SubscriptionTopic.forReplaySubject<boolean>();
    
    static readonly NavigationDrawerNoAnimationsChange = SubscriptionTopic.forReplaySubject<boolean>();

    static readonly ThemeChange = SubscriptionTopic.forReplaySubject<ThemeInfo>();

    private constructor() {
        
    }

}
