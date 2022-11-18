import { Nullable } from '@fgo-planner/common-core';
import { MasterAccount, UserPreferences } from '@fgo-planner/data-core';
import { BasicMasterAccounts, GlobalDialogOpenAction, HttpResponseError, MasterAccountChanges, PageMetadata, ThemeInfo, UserTokenPayload } from '../../types';
import { Functions } from '../functions';
import { SubscriptionTopic } from './subscription-topic.class';

const Audio = {

    BackgroundPlayStatusChange: SubscriptionTopic.forSubject<boolean>(),

    SoundtrackPlayStatusChange: SubscriptionTopic.forSubject<boolean>()

} as const;

const User = {

    CurrentMasterAccountChange: SubscriptionTopic.forBehaviorSubject<Nullable<MasterAccount>>(Functions.nullSupplier),

    CurrentUserChange: SubscriptionTopic.forBehaviorSubject<Nullable<UserTokenPayload>>(Functions.nullSupplier),

    // TODO Wrap UserPreferences with Immutable<>
    CurrentUserPreferencesChange: SubscriptionTopic.forBehaviorSubject<Nullable<UserPreferences>>(Functions.nullSupplier),

    MasterAccountListChange: SubscriptionTopic.forBehaviorSubject<Nullable<BasicMasterAccounts>>(Functions.nullSupplier),

    MasterAccountChangesAvailable: SubscriptionTopic.forReplaySubject<MasterAccountChanges>(),

    Unauthorized: SubscriptionTopic.forReplaySubject<HttpResponseError>()

} as const;

const UserInterface = {

    AppBarElevatedChange: SubscriptionTopic.forReplaySubject<boolean>(),

    GlobalDialogAction: SubscriptionTopic.forReplaySubject<GlobalDialogOpenAction>(),

    LoadingIndicatorActiveChange: SubscriptionTopic.forReplaySubject<boolean>(),

    MetadataChange: SubscriptionTopic.forReplaySubject<PageMetadata>(),

    // NavigationDrawerContentChange: SubscriptionTopic.forReplaySubject<Nullable<NavigationDrawerContent>>(),
    
    NavigationDrawerOpenChange: SubscriptionTopic.forReplaySubject<boolean>(),
    
    NavigationDrawerNoAnimationsChange: SubscriptionTopic.forReplaySubject<boolean>(),

    ThemeChange: SubscriptionTopic.forReplaySubject<ThemeInfo>()

} as const;

export const SubscriptionTopics = {
    Audio,
    User,
    UserInterface
} as const;
