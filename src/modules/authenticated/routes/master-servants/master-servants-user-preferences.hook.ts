import { useCallback, useEffect, useState } from 'react';
import { Immutable } from '../../../../types/internal';
import { StorageKeys } from '../../../../utils/storage/storage-keys';
import { StorageUtils } from '../../../../utils/storage/storage.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';

//#region Type definitions

/**
 * Account specific local storage data for the master servants route.
 */
type LocalStorageAccountSpecificData = {

};

/**
 * Local storage data for the master servants route.
 */
type LocalStorageData = {
    infoPanelOpen: boolean;
    /**
     * Contains preferences specific to each master account.
     */
    masterAccountsMap: Record<string, LocalStorageAccountSpecificData>;
};

export type MasterServantsUserPreferences = {
    infoPanelOpen: boolean;
};

export type MasterServantsUserPreferencesHookResult = {
    /**
     * An object containing the user preferences for the route.
     */
    userPreferences: Immutable<MasterServantsUserPreferences>;

    toggleInfoPanelOpen: () => void;
};

//#endregion


//#region Internal helper functions

const StorageKey = StorageKeys.LocalUserPreference.Route.MasterServants;

const getDefaultLocalStorageValue = (): LocalStorageData => ({
    infoPanelOpen: false,
    masterAccountsMap: {}
});

const getDefaultUserPreferences = (): MasterServantsUserPreferences => ({
    infoPanelOpen: false
});

const readUserPreferencesFromLocalStorage = (
    masterAccountId?: string
): MasterServantsUserPreferences => {
    try {
        const localStorageData = StorageUtils.getItem<LocalStorageData>(StorageKey, getDefaultLocalStorageValue);
        return {
            infoPanelOpen: localStorageData.infoPanelOpen
        };
    } catch (e) {
        console.error(`Error reading ${StorageKey.key} value from local storage, using default value.`);
        return getDefaultUserPreferences();
    }
};

const updateLocalStorageAccountSpecificData = (
    masterAccountsMap: Record<string, LocalStorageAccountSpecificData>,
    userPreferences: MasterServantsUserPreferences,
    masterAccountId?: string
): Record<string, LocalStorageAccountSpecificData> => {
    if (masterAccountId) {
        masterAccountsMap[masterAccountId] = {
            // TODO Populate this.
        };
    }
    return masterAccountsMap;
};

const writeUserPreferencesToLocalStorage = (
    userPreferences: MasterServantsUserPreferences,
    masterAccountId?: string,
    skipAccountMapUpdate = false
): MasterServantsUserPreferences => {
    let masterAccountsMap: Record<string, LocalStorageAccountSpecificData>;
    try {
        const localStorageData = StorageUtils.getItem<LocalStorageData>(StorageKey, getDefaultLocalStorageValue);
        masterAccountsMap = localStorageData.masterAccountsMap;
        if (!skipAccountMapUpdate) {
            updateLocalStorageAccountSpecificData(masterAccountsMap, userPreferences, masterAccountId);
        }
    } catch (e) {
        console.error(`Error reading existing ${StorageKey.key} value from local storage, performing complete override.`);
        /**
         * This write account specific data even if `skipAccountMapUpdate` flag is `false`.
         */
        masterAccountsMap = updateLocalStorageAccountSpecificData({}, userPreferences, masterAccountId);
    }
    const updatedLocalStorageData: LocalStorageData = {
        infoPanelOpen: userPreferences.infoPanelOpen,
        masterAccountsMap
    };
    StorageUtils.setItem(StorageKey, updatedLocalStorageData);
    return userPreferences;
};

//#endregion


/**
 * Utility hook for reading and writing global and local user preferences that
 * are relevant to the master servants route.
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
        const userPreferences = readUserPreferencesFromLocalStorage(masterAccountId);
        setUserPreferences(userPreferences);
    }, [masterAccountId]);

    const toggleInfoPanelOpen = useCallback((): void => {
        setUserPreferences((userPreferences: MasterServantsUserPreferences) => {
            const updatedUserPreferences = {
                ...userPreferences,
                infoPanelOpen: !userPreferences.infoPanelOpen
            };
            return writeUserPreferencesToLocalStorage(updatedUserPreferences, masterAccountId, true);
        });
    }, [masterAccountId]);

    return {
        userPreferences,
        toggleInfoPanelOpen
    };

};
