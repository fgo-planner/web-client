import { Immutable } from '@fgo-planner/common-core';
import { useCallback, useEffect, useState } from 'react';
import { StorageKeys } from '../../../../../utils/storage/storage-keys';
import { StorageUtils } from '../../../../../utils/storage/storage.utils';
import { SubscribablesContainer } from '../../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../../utils/subscription/subscription-topics';
import { MasterServantEditTab } from '../../../components/master/servant/edit-dialog/MasterServantEditDialogContent';

//#region Default values

const FiltersEnabledDefault = false;

const InfoPanelOpenDefault = true;

const ServantEditDialogActiveTabDefault = 'general';

const ShowUnsummonedServantsDefault = true;

//#endregion


/**
 * User preferences for the master servants route that are stored locally.
 */
type MasterServantsLocalUserPreferences = {
    filtersEnabled: boolean;
    infoPanelOpen: boolean;
    servantEditDialogActiveTab: MasterServantEditTab;
    showUnsummonedServants: boolean;
};

export type MasterServantsUserPreferences = MasterServantsLocalUserPreferences & {
    // TODO
};

export type MasterServantsUserPreferencesHookResult = {
    /**
     * An object containing the user preferences for the route.
     */
    userPreferences: Immutable<MasterServantsUserPreferences>;

    setServantEditDialogActiveTab: (tab: MasterServantEditTab) => void;
    toggleFilters: () => void;
    toggleInfoPanelOpen: () => void;
    toggleShowUnsummonedServants: () => void;
};

//#endregion


//#region Internal helper functions

const StorageKey = StorageKeys.LocalUserPreference.Route.MasterServants;

const getDefaultLocalUserPreferences = (): MasterServantsLocalUserPreferences => ({
    filtersEnabled: FiltersEnabledDefault,
    infoPanelOpen: InfoPanelOpenDefault,
    servantEditDialogActiveTab: ServantEditDialogActiveTabDefault,
    showUnsummonedServants: ShowUnsummonedServantsDefault
});

const getDefaultUserPreferences = (): MasterServantsUserPreferences => ({
    ...getDefaultLocalUserPreferences()
});

const readUserPreferencesFromLocalStorage = (): MasterServantsUserPreferences => {
    try {
        const localStorageData = StorageUtils.getItem<Partial<MasterServantsLocalUserPreferences>>(
            StorageKey, 
            getDefaultLocalUserPreferences
        );
        // const accountSpecificData = getLocalStorageAccountSpecificData(localStorageData, masterAccountId);
        return {
            filtersEnabled: localStorageData.filtersEnabled ?? FiltersEnabledDefault,
            infoPanelOpen: localStorageData.infoPanelOpen ?? InfoPanelOpenDefault,
            servantEditDialogActiveTab: localStorageData.servantEditDialogActiveTab || ServantEditDialogActiveTabDefault,
            showUnsummonedServants: localStorageData.showUnsummonedServants ?? ShowUnsummonedServantsDefault
        };
    } catch (e) {
        console.error(`Error reading ${StorageKey.key} value from local storage, using default value.`);
        return getDefaultUserPreferences();
    }
};

const writeUserPreferencesToLocalStorage = (userPreferences: MasterServantsUserPreferences): MasterServantsUserPreferences => {
    StorageUtils.setItem<MasterServantsLocalUserPreferences>(StorageKey, userPreferences);
    return userPreferences;
};

//#endregion


/**
 * Utility hook for reading and writing global and local user preferences that
 * are relevant to the master servants route. 
 *
 * This is intended to be used only within the `MasterServants` route component,
 * do not use inside any other component!
 */
export const useMasterServantsUserPreferences = (): MasterServantsUserPreferencesHookResult => {

    const [userPreferences, setUserPreferences] = useState<MasterServantsUserPreferences>(getDefaultUserPreferences);

    /**
     * Load global user preferences.
     * 
     * TODO Maybe wrap this in a reusable hook.
     */
    useEffect(() => {
        const subscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentUserPreferencesChange)
            .subscribe((userPreferences) => {
                // TODO Do something with this.
            });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const userPreferences = readUserPreferencesFromLocalStorage();
        setUserPreferences(userPreferences);
    }, []);

    const setServantEditDialogActiveTab = useCallback((tab: MasterServantEditTab): void => {
        setUserPreferences(userPreferences => {
            return writeUserPreferencesToLocalStorage({
                ...userPreferences,
                servantEditDialogActiveTab: tab
            });
        });
    }, []);

    const toggleFilters = useCallback((): void => {
        setUserPreferences(userPreferences => {
            return writeUserPreferencesToLocalStorage({
                ...userPreferences,
                filtersEnabled: !userPreferences.filtersEnabled
            });
        });
    }, []);

    const toggleInfoPanelOpen = useCallback((): void => {
        setUserPreferences(userPreferences => {
            return writeUserPreferencesToLocalStorage({
                ...userPreferences,
                infoPanelOpen: !userPreferences.infoPanelOpen
            });
        });
    }, []);

    const toggleShowUnsummonedServants = useCallback((): void => {
        setUserPreferences(userPreferences => {
            return writeUserPreferencesToLocalStorage({
                ...userPreferences,
                showUnsummonedServants: !userPreferences.showUnsummonedServants
            });
        });
    }, []);

    return {
        userPreferences,
        setServantEditDialogActiveTab,
        toggleFilters,
        toggleInfoPanelOpen,
        toggleShowUnsummonedServants
    };

};
