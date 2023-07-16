import { Immutable, ObjectUtils } from '@fgo-planner/common-core';
import { Schema, Validator } from 'jsonschema';
import { merge } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { StorageKeyReadError } from '../../../../../errors/StorageKeyRead.error';
import { StorageKeyValidationError } from '../../../../../errors/StorageKeyValidation.error';
import { JsonSchemas } from '../../../../../utils/JsonSchemas';
import { StorageKeys } from '../../../../../utils/storage/StorageKeys';
import { StorageUtils } from '../../../../../utils/storage/StorageUtils';
import { SubscribablesContainer } from '../../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../../utils/subscription/SubscriptionTopics';
import { MasterServantEditDialogTab } from '../../../components/master/servant/edit-dialog/MasterServantEditDialogTab.enum';
import { MasterServantListColumn } from '../../../components/master/servant/list/MasterServantListColumn';


//#region Type definitions

/**
 * User preferences for the master servants route that are stored locally.
 */
type MasterServantsRouteLocalUserPreferences = {
    filtersEnabled: boolean;
    infoPanelOpen: boolean;
    servantEditDialogActiveTab: MasterServantEditDialogTab;
    showUnsummonedServants: boolean;
    visibleColumns: MasterServantListColumn.Visibility;  // TODO Maybe store this globally
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
    setVisibleColumns(visibleColumns: MasterServantListColumn.Visibility): void;
    toggleFilters(): void;
    toggleInfoPanelOpen(): void;
    toggleShowUnsummonedServants(): void;
};

//#endregion


//#region Schema definition and validator

const LocalUserPreferencesSchema: Schema = {
    properties: {
        filtersEnabled: JsonSchemas.OptionalBoolean,
        infoPanelOpen: JsonSchemas.OptionalBoolean,
        servantEditDialogActiveTab: {
            type: 'string',
            enum: Object.keys(MasterServantEditDialogTab),
            required: false
        },
        showUnsummonedServants: JsonSchemas.OptionalBoolean,
        visibleColumns: {
            $ref: '/visibleColumns',
            required: false
        }
    }
};

const LocalUserPreferencesVisibleColumnsSchema: Schema = {
    id: '/visibleColumns',
    properties: {
        npLevel: JsonSchemas.OptionalBoolean,
        level: JsonSchemas.OptionalBoolean,
        bondLevel: JsonSchemas.OptionalBoolean,
        fouHp: JsonSchemas.OptionalBoolean,
        fouAtk: JsonSchemas.OptionalBoolean,
        skills: JsonSchemas.OptionalBoolean,
        appendSkills: JsonSchemas.OptionalBoolean,
        summonDate: JsonSchemas.OptionalBoolean
    }
};

const LocalUserPreferencesValidator = new Validator();
LocalUserPreferencesValidator.addSchema(LocalUserPreferencesVisibleColumnsSchema);

//#endregion


//#region Internal helper functions

const StorageKey = StorageKeys.LocalUserPreference.Route.MasterServants;

const getDefaultLocalUserPreferences = (): MasterServantsRouteLocalUserPreferences => ({
    filtersEnabled: false,
    infoPanelOpen: true,
    servantEditDialogActiveTab: MasterServantEditDialogTab.General,
    showUnsummonedServants: true,
    visibleColumns: {
        npLevel: true,
        level: true,
        bondLevel: true,
        fouHp: true,
        fouAtk: true,
        skills: true,
        appendSkills: true,
        summonDate: true
    }
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            return writeUserPreferencesToLocalStorage({
                ...userPreferences,
                servantEditDialogActiveTab: tab
            });
        });
    }, []);

    const setVisibleColumns = useCallback((visibleColumns: MasterServantListColumn.Visibility): void => {
        setUserPreferences(userPreferences => {
            if (ObjectUtils.isShallowEquals(userPreferences.visibleColumns, visibleColumns)) {
                return userPreferences;
            }
            return writeUserPreferencesToLocalStorage({
                ...userPreferences,
                visibleColumns
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
        setVisibleColumns,
        toggleFilters,
        toggleInfoPanelOpen,
        toggleShowUnsummonedServants
    };

};
