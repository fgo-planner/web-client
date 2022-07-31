import { useCallback, useEffect, useState } from 'react';
import { Immutable } from '../../../../../types/internal';
import { StorageKeys } from '../../../../../utils/storage/storage-keys';
import { StorageUtils } from '../../../../../utils/storage/storage.utils';
import { SubscribablesContainer } from '../../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../../utils/subscription/subscription-topics';

//#region Default values

const FiltersEnabledDefault = false;

const InfoPanelOpenDefault = true;

const ShowUnsummonedServantsDefault = true;

//#endregion


/**
 * User preferences for the master servants route that are stored locally.
 */
type MasterServantsLocalUserPreferences = {
    filtersEnabled: boolean;
    infoPanelOpen: boolean;
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
    showUnsummonedServants: ShowUnsummonedServantsDefault
});

const getDefaultUserPreferences = (): MasterServantsUserPreferences => ({
    ...getDefaultLocalUserPreferences()
});

const readUserPreferencesFromLocalStorage = (): MasterServantsUserPreferences => {
    try {
        const localStorageData = StorageUtils.getItem<MasterServantsLocalUserPreferences>(StorageKey, getDefaultLocalUserPreferences);
        // const accountSpecificData = getLocalStorageAccountSpecificData(localStorageData, masterAccountId);
        return {
            filtersEnabled: !!localStorageData.filtersEnabled,
            infoPanelOpen: !!localStorageData.infoPanelOpen,
            showUnsummonedServants: !!localStorageData.showUnsummonedServants
        };
    } catch (e) {
        console.error(`Error reading ${StorageKey.key} value from local storage, using default value.`);
        return getDefaultUserPreferences();
    }
};

const writeUserPreferencesToLocalStorage = (userPreferences: MasterServantsUserPreferences): MasterServantsUserPreferences => {

    const {
        ...updatedLocalStorageData
    } = userPreferences;

    StorageUtils.setItem<MasterServantsLocalUserPreferences>(StorageKey, updatedLocalStorageData);
    return userPreferences;
};

//#endregion


/**
 * Utility hook for reading and writing global and local user preferences that
 * are relevant to the master servants route. 
 *
 * This is intended to be used only within the `MasterServants` route component,
 * do not use inside any other component!
 * 
 * @param masterAccountId The currently active master account's ID.
 */
export const useMasterServantsUserPreferencesHook = (masterAccountId?: string): MasterServantsUserPreferencesHookResult => {

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

    const toggleFilters = useCallback((): void => {
        setUserPreferences((userPreferences: MasterServantsUserPreferences) => {
            const updatedUserPreferences = {
                ...userPreferences,
                filtersEnabled: !userPreferences.filtersEnabled
            };
            return writeUserPreferencesToLocalStorage(updatedUserPreferences);
        });
    }, []);

    const toggleInfoPanelOpen = useCallback((): void => {
        setUserPreferences((userPreferences: MasterServantsUserPreferences) => {
            const updatedUserPreferences = {
                ...userPreferences,
                infoPanelOpen: !userPreferences.infoPanelOpen
            };
            return writeUserPreferencesToLocalStorage(updatedUserPreferences);
        });
    }, []);

    const toggleShowUnsummonedServants = useCallback((): void => {
        setUserPreferences((userPreferences: MasterServantsUserPreferences) => {
            const updatedUserPreferences = {
                ...userPreferences,
                showUnsummonedServants: !userPreferences.showUnsummonedServants
            };
            return writeUserPreferencesToLocalStorage(updatedUserPreferences);
        });
    }, []);

    return {
        userPreferences,
        toggleFilters,
        toggleInfoPanelOpen,
        toggleShowUnsummonedServants
    };

};
