import { Immutable } from '@fgo-planner/common-core';
import { Schema, Validator } from 'jsonschema';
import { cloneDeep, merge } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import { PlanRequirementsTableCellSize } from '../../../../../components/plan/requirements/table/PlanRequirementsTableCellSize.enum';
import { PlanRequirementsTableOptions } from '../../../../../components/plan/requirements/table/PlanRequirementsTableOptions.type';
import { PlanRequirementsTableServantRowHeaderLayout } from '../../../../../components/plan/requirements/table/PlanRequirementsTableServantRowHeaderLayout.enum';
import { StorageKeyReadError } from '../../../../../errors/StorageKeyRead.error';
import { StorageKeyValidationError } from '../../../../../errors/StorageKeyValidation.error';
import { JsonSchemas } from '../../../../../utils/JsonSchemas';
import { StorageKeys } from '../../../../../utils/storage/StorageKeys';
import { StorageUtils } from '../../../../../utils/storage/StorageUtils';
import { SubscribablesContainer } from '../../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../../utils/subscription/SubscriptionTopics';
import { MasterServantEditDialogTab } from '../../../components/master/servant/edit-dialog/MasterServantEditDialogTab.enum';
import { PlanRouteMasterItemsEditDialogTab } from '../components/PlanRouteMasterItemsEditDialogTab.enum';


//#region Type definitions

/**
 * User preferences for the plan route that are stored locally.
 */
type PlanRouteLocalUserPreferences = {
    masterServantEditDialogActiveTab: MasterServantEditDialogTab;
    planServantEditDialogActiveTab: PlanRouteMasterItemsEditDialogTab;
    table: PlanRequirementsTableOptions;
};

export type PlanRouteUserPreferences = PlanRouteLocalUserPreferences & {
    // TODO
};

export type PlanRouteUserPreferencesHookResult = {
    /**
     * An object containing the user preferences for the route.
     */
    userPreferences: Immutable<PlanRouteUserPreferences>;
    setMasterServantEditDialogActiveTab: (tab: MasterServantEditDialogTab) => void;
    setPlanServantEditDialogActiveTab: (tab: PlanRouteMasterItemsEditDialogTab) => void;
    toggleCellSize: () => void;
    toggleRowHeaderMode: () => void;
    toggleShowEmptyColumns: () => void;
};

//#endregion


//#region Schema definition and validator

const LocalUserPreferencesSchema: Schema = {
    properties: {
        masterServantEditDialogActiveTab: {
            type: 'string',
            enum: Object.keys(PlanRouteMasterItemsEditDialogTab),
            required: false
        },
        planServantEditDialogActiveTab: {
            type: 'string',
            enum: Object.keys(PlanRouteMasterItemsEditDialogTab),
            required: false
        },
        table: {
            properties: {
                layout: {
                    $ref: '/table/layout',
                    required: false
                },
                displayItems: {
                    $ref: '/table/displayItems',
                    required: false
                }
            }
        }
    }
};

const LocalUserPreferencesTableLayoutSchema: Schema = {
    id: '/table/layout',
    properties: {
        cells: {
            type: 'string',
            enum: Object.keys(PlanRequirementsTableCellSize),  
            required: false
        },
        rowHeader: {
            type: 'string',
            enum: Object.keys(PlanRequirementsTableServantRowHeaderLayout), 
            required: false
        }
    }
};

const LocalUserPreferencesTableDisplayItemsSchema: Schema = {
    id: '/table/displayItems',
    properties: {
        empty: JsonSchemas.OptionalBoolean,
        statues: JsonSchemas.OptionalBoolean,
        gems: JsonSchemas.OptionalBoolean,
        lores: JsonSchemas.OptionalBoolean,
        grails: JsonSchemas.OptionalBoolean,
        embers: JsonSchemas.OptionalBoolean,
        fous: JsonSchemas.OptionalBoolean,
        qp: JsonSchemas.OptionalBoolean
    }
};

const LocalUserPreferencesValidator = new Validator();
LocalUserPreferencesValidator.addSchema(LocalUserPreferencesTableLayoutSchema);
LocalUserPreferencesValidator.addSchema(LocalUserPreferencesTableDisplayItemsSchema);

//#endregion


//#region Internal helper functions

const StorageKey = StorageKeys.LocalUserPreference.Route.Plan;

const getDefaultLocalUserPreferences = (): PlanRouteLocalUserPreferences => ({
    masterServantEditDialogActiveTab: MasterServantEditDialogTab.Enhancements,
    planServantEditDialogActiveTab: PlanRouteMasterItemsEditDialogTab.Enhancements,
    table: {
        layout: {
            cells: PlanRequirementsTableCellSize.Normal,
            rowHeader: PlanRequirementsTableServantRowHeaderLayout.Name
        },
        displayItems: {
            empty: true,
            statues: true,
            gems: true,
            lores: true,
            grails: true,
            embers: true,
            fous: true,
            qp: true
        }
    }
});

const getDefaultUserPreferences = (): PlanRouteUserPreferences => ({
    ...getDefaultLocalUserPreferences()
});

const readUserPreferencesFromLocalStorage = (): PlanRouteLocalUserPreferences => {
    let localStorageData;
    try {
        localStorageData = StorageUtils.getItemWithValidation<Partial<PlanRouteLocalUserPreferences>>(
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

const writeUserPreferencesToLocalStorage = (userPreferences: PlanRouteUserPreferences): PlanRouteUserPreferences => {
    StorageUtils.setItem<PlanRouteLocalUserPreferences>(StorageKey, userPreferences);
    return userPreferences;
};

//#endregion


/**
 * Utility hook for reading and writing global and local user preferences that
 * are relevant to the master servants route. 
 *
 * This is intended to be used only within the `Plan` route component,
 * do not use inside any other component!
 */
export const usePlanRouteUserPreferences = (): PlanRouteUserPreferencesHookResult => {

    const [userPreferences, setUserPreferences] = useState<PlanRouteUserPreferences>(getDefaultUserPreferences);

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

    const setMasterServantEditDialogActiveTab = useCallback((tab: MasterServantEditDialogTab): void => {
        setUserPreferences(userPreferences => {
            const updated = cloneDeep(userPreferences);
            updated.masterServantEditDialogActiveTab = tab;
            return writeUserPreferencesToLocalStorage(updated);
        });
    }, []);

    const setPlanServantEditDialogActiveTab = useCallback((tab: PlanRouteMasterItemsEditDialogTab): void => {
        setUserPreferences(userPreferences => {
            const updated = cloneDeep(userPreferences);
            updated.planServantEditDialogActiveTab = tab;
            return writeUserPreferencesToLocalStorage(updated);
        });
    }, []);

    const toggleCellSize = useCallback((): void => {
        setUserPreferences(userPreferences => {
            const currentValue = userPreferences.table.layout.cells;
            const nextValue = currentValue === PlanRequirementsTableCellSize.Condensed ?
                PlanRequirementsTableCellSize.Normal :
                PlanRequirementsTableCellSize.Condensed;
            const updated = cloneDeep(userPreferences);
            updated.table.layout.cells = nextValue;
            return writeUserPreferencesToLocalStorage(updated);
        });
    }, []);

    const toggleShowEmptyColumns = useCallback((): void => {
        setUserPreferences(userPreferences => {
            const updated = cloneDeep(userPreferences);
            updated.table.displayItems.empty = !userPreferences.table.displayItems.empty;
            return writeUserPreferencesToLocalStorage(updated);
        });
    }, []);

    const toggleRowHeaderMode = useCallback((): void => {
        setUserPreferences(userPreferences => {
            const currentValue = userPreferences.table.layout.rowHeader;
            const nextValue = currentValue === PlanRequirementsTableServantRowHeaderLayout.Name ?
                PlanRequirementsTableServantRowHeaderLayout.Targets :
                PlanRequirementsTableServantRowHeaderLayout.Name;
            const updated = cloneDeep(userPreferences);
            updated.table.layout.rowHeader = nextValue;
            return writeUserPreferencesToLocalStorage(updated);
        });
    }, []);

    return {
        userPreferences,
        setMasterServantEditDialogActiveTab,
        setPlanServantEditDialogActiveTab,
        toggleCellSize,
        toggleRowHeaderMode,
        toggleShowEmptyColumns
    };

};
