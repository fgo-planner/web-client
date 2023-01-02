import { Immutable } from '@fgo-planner/common-core';
import { useCallback, useEffect, useState } from 'react';
import { PlanRequirementsTableOptions } from '../../../../../components/plan/requirements/table/PlanRequirementsTableOptions.type';
import { StorageKeys } from '../../../../../utils/storage/storage-keys';
import { StorageUtils } from '../../../../../utils/storage/storage.utils';
import { SubscribablesContainer } from '../../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../../utils/subscription/subscription-topics';
import { MasterServantEditTab } from '../../../components/master/servant/edit-dialog/MasterServantEditDialogContent';
import { PlanServantEditTab } from '../components/PlanRoutePlanServantEditDialogContent';

/**
 * User preferences for the plan route that are stored locally.
 */
type PlanLocalUserPreferences = Immutable<{
    masterServantEditDialogActiveTab: MasterServantEditTab;
    planServantEditDialogActiveTab: PlanServantEditTab;
    table: PlanRequirementsTableOptions;
}>;

const DefaultTableValues = {
    layout: {
        cells: 'normal',
        rowHeader: 'name'
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
} as const satisfies PlanRequirementsTableOptions;

const DefaultValues: PlanLocalUserPreferences = {
    masterServantEditDialogActiveTab: 'enhancements',
    planServantEditDialogActiveTab: 'enhancements',
    table: DefaultTableValues
};

export type PlanUserPreferences = PlanLocalUserPreferences & {
    // TODO
};

export type PlanUserPreferencesHookResult = {
    /**
     * An object containing the user preferences for the route.
     */
    userPreferences: Immutable<PlanUserPreferences>;

    setMasterServantEditDialogActiveTab: (tab: MasterServantEditTab) => void;
    setPlanServantEditDialogActiveTab: (tab: PlanServantEditTab) => void;
    toggleCellSize: () => void;
    toggleRowHeaderMode: () => void;
    toggleShowEmptyColumns: () => void;
};

//#endregion


//#region Internal helper functions

const StorageKey = StorageKeys.LocalUserPreference.Route.Plan;

const getDefaultLocalUserPreferences = (): PlanLocalUserPreferences => ({
    ...DefaultValues
});

const getDefaultUserPreferences = (): PlanUserPreferences => ({
    ...getDefaultLocalUserPreferences()
});

const readFromLocalStorage = (): PlanUserPreferences => {
    try {
        const localStorageData = StorageUtils.getItem<Partial<PlanLocalUserPreferences>>(
            StorageKey, 
            getDefaultLocalUserPreferences
        );
        // const accountSpecificData = getLocalStorageAccountSpecificData(localStorageData, masterAccountId);
        // TODO Implement JSON schema validation.
        return localStorageData as any;
    } catch (e) {
        console.error(`Error reading ${StorageKey.key} value from local storage, using default value.`);
        return getDefaultUserPreferences();
    }
};

const writeToLocalStorage = (userPreferences: PlanUserPreferences): PlanUserPreferences => {
    StorageUtils.setItem<PlanLocalUserPreferences>(StorageKey, userPreferences);
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
export const usePlanRouteUserPreferences = (): PlanUserPreferencesHookResult => {

    const [userPreferences, setUserPreferences] = useState<PlanUserPreferences>(getDefaultUserPreferences);

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
        const userPreferences = readFromLocalStorage();
        setUserPreferences(userPreferences);
    }, []);

    const setMasterServantEditDialogActiveTab = useCallback((tab: MasterServantEditTab): void => {
        setUserPreferences(userPreferences => {
            return writeToLocalStorage({
                ...userPreferences,
                masterServantEditDialogActiveTab: tab
            });
        });
    }, []);

    const setPlanServantEditDialogActiveTab = useCallback((tab: PlanServantEditTab): void => {
        setUserPreferences(userPreferences => {
            return writeToLocalStorage({
                ...userPreferences,
                planServantEditDialogActiveTab: tab
            });
        });
    }, []);

    const toggleCellSize = useCallback((): void => {
        setUserPreferences(userPreferences => {
            const currentValue = userPreferences.table.layout.cells;
            return writeToLocalStorage({
                ...userPreferences,
                table: {
                    ...userPreferences.table,
                    layout: {
                        ...userPreferences.table.layout,
                        cells: currentValue === 'condensed' ? 'normal' : 'condensed'
                    }
                }
            });
        });
    }, []);

    const toggleShowEmptyColumns = useCallback((): void => {
        setUserPreferences(userPreferences => {
            const currentValue = userPreferences.table.displayItems.empty;
            return writeToLocalStorage({
                ...userPreferences,
                table: {
                    ...userPreferences.table,
                    displayItems: {
                        ...userPreferences.table.displayItems,
                        empty: !currentValue
                    }
                }
            });
        });
    }, []);

    const toggleRowHeaderMode = useCallback((): void => {
        setUserPreferences(userPreferences => {
            const currentValue = userPreferences.table.layout.rowHeader;
            return writeToLocalStorage({
                ...userPreferences,
                table: {
                    ...userPreferences.table,
                    layout: {
                        ...userPreferences.table.layout,
                        rowHeader: currentValue === 'name' ? 'targets' : 'name'
                    }
                }
            });
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
