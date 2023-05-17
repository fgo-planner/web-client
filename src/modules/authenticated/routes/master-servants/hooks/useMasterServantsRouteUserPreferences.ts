import { Immutable } from '@fgo-planner/common-core';
import { Schema, Validator } from 'jsonschema';
import { cloneDeep, merge } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { StorageKeyReadError } from '../../../../../errors/StorageKeyRead.error';
import { StorageKeyValidationError } from '../../../../../errors/StorageKeyValidation.error';
import { StorageKeys } from '../../../../../utils/storage/StorageKeys';
import { StorageUtils } from '../../../../../utils/storage/StorageUtils';
import { SubscribablesContainer } from '../../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../../utils/subscription/SubscriptionTopics';
import { MasterServantEditDialogTab } from '../../../components/master/servant/edit-dialog/MasterServantEditDialogTab.enum';


//#region Type definitions

/**
 * User preferences for the master servants route that are stored locally.
 */
type MasterServantsRouteLocalUserPreferences = {
    filtersEnabled: boolean;
    infoPanelOpen: boolean;
    servantEditDialogActiveTab: MasterServantEditDialogTab;
    showUnsummonedServants: boolean;
};

export type MasterServantsRouteUserPreferences = MasterServantsRouteLocalUserPreferences & {
    // TODO
};

export type MasterServantsRouteUserPreferencesHookResult = {
    /**
     * An object containing the user preferences for the route.
     */
    userPreferences: Immutable<MasterServantsRouteUserPreferences>;
    setServantEditDialogActiveTab(tab: MasterServantEditDialogTab): void;
    toggleFilters(): void;
    toggleInfoPanelOpen(): void;
    toggleShowUnsummonedServants(): void;
};

//#endregion


//#region Schema definition and validator

const LocalUserPreferencesSchema: Schema = {
    properties: {
        filtersEnabled: {
            type: 'boolean',
            required: false
        },
        infoPanelOpen: {
            type: 'boolean',
            required: false
        },
        servantEditDialogActiveTab: {
            type: 'string',
            enum: Object.keys(MasterServantEditDialogTab),
            required: false
        },
        showUnsummonedServants: {
            type: 'boolean',
            required: false
        }
    }
};

const LocalUserPreferencesValidator = new Validator();

//#endregion


//#region Internal helper functions

const StorageKey = StorageKeys.LocalUserPreference.Route.MasterServants;

const getDefaultLocalUserPreferences = (): MasterServantsRouteLocalUserPreferences => ({
    filtersEnabled: false,
    infoPanelOpen: true,
    servantEditDialogActiveTab: MasterServantEditDialogTab.General,
    showUnsummonedServants: true
});

const getDefaultUserPreferences = (): MasterServantsRouteUserPreferences => ({
    ...getDefaultLocalUserPreferences()
});

const readUserPreferencesFromLocalStorage = (): MasterServantsRouteUserPreferences => {
    let localStorageData;
    try {
        localStorageData = StorageUtils.getItemWithValidation<Partial<MasterServantsRouteUserPreferences>>(
            StorageKey, 
            LocalUserPreferencesValidator,
            LocalUserPreferencesSchema
        );
    } catch (e) {
        if (e instanceof StorageKeyReadError || e instanceof StorageKeyValidationError) {
            console.warn(`${e.message}, using default values`);
        } else {
            console.warn(e);
        }
    }
    const result = getDefaultLocalUserPreferences();
    if (localStorageData) {
        merge(result, localStorageData);
    }
    return result;
};

const writeUserPreferencesToLocalStorage = (userPreferences: MasterServantsRouteUserPreferences): MasterServantsRouteUserPreferences => {
    StorageUtils.setItem<MasterServantsRouteLocalUserPreferences>(StorageKey, userPreferences);
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
export const useMasterServantsRouteUserPreferences = (): MasterServantsRouteUserPreferencesHookResult => {

    const [userPreferences, setUserPreferences] = useState<MasterServantsRouteUserPreferences>(getDefaultUserPreferences);

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

    const setServantEditDialogActiveTab = useCallback((tab: MasterServantEditDialogTab): void => {
        setUserPreferences(userPreferences => {
            const updated = cloneDeep(userPreferences);
            updated.servantEditDialogActiveTab = tab;
            return writeUserPreferencesToLocalStorage(updated);
        });
    }, []);

    const toggleFilters = useCallback((): void => {
        setUserPreferences(userPreferences => {
            const updated = cloneDeep(userPreferences);
            updated.filtersEnabled = !userPreferences.filtersEnabled;
            return writeUserPreferencesToLocalStorage(updated);
        });
    }, []);

    const toggleInfoPanelOpen = useCallback((): void => {
        setUserPreferences(userPreferences => {
            const updated = cloneDeep(userPreferences);
            updated.infoPanelOpen = !userPreferences.infoPanelOpen;
            return writeUserPreferencesToLocalStorage(updated);
        });
    }, []);

    const toggleShowUnsummonedServants = useCallback((): void => {
        setUserPreferences(userPreferences => {
            const updated = cloneDeep(userPreferences);
            updated.showUnsummonedServants = !userPreferences.showUnsummonedServants;
            return writeUserPreferencesToLocalStorage(updated);
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
