import { MasterAccount, UserPreferences } from '@fgo-planner/types';
import { HttpResponseError, Nullable, PageMetadata, ReadonlyPartialArray, ThemeInfo, UserInfo } from '../../types/internal';

type MasterAccountList = Nullable<ReadonlyPartialArray<MasterAccount>>;

export class SubscriptionTopic<T = any> {
    
    static readonly Audio_BackgroundPlayStatusChange = new SubscriptionTopic<boolean>();

    static readonly Audio_SoundtrackPlayStatusChange = new SubscriptionTopic<boolean>();

    static readonly User_CurrentMasterAccountChange = new SubscriptionTopic<Nullable<MasterAccount>>(() => null);

    static readonly User_CurrentMasterAccountUpdate = new SubscriptionTopic<MasterAccount>();

    static readonly User_CurrentUserChange = new SubscriptionTopic<Nullable<UserInfo>>(() => null);
    
    static readonly User_CurrentUserPreferencesChange = new SubscriptionTopic<Nullable<UserPreferences>>(() => null);

    static readonly User_MasterAccountListChange = new SubscriptionTopic<MasterAccountList>(() => null);

    static readonly User_Unauthorized = new SubscriptionTopic<HttpResponseError>();
    
    static readonly UserInterface_AppBarElevatedChange = new SubscriptionTopic<boolean>();

    static readonly UserInterface_LoadingIndicatorDisplayChange = new SubscriptionTopic<boolean>();

    static readonly UserInterface_MetadataChange = new SubscriptionTopic<PageMetadata>();

    static readonly UserInterface_ThemeChange = new SubscriptionTopic<ThemeInfo>();

    /**
     * Whether the topic was initialized with a default value. If true, then the
     * `Subject` returned for the topic will also be of the `BehaviorSubject` type.
     */
    readonly hasInitialValue: boolean;

    constructor(readonly initializer?: () => T) {
        this.hasInitialValue = !!initializer;
    }

}
