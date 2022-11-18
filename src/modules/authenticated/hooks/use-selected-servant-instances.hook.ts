import { CollectionUtils } from '@fgo-planner/common-core';
import { InstantiatedServant, InstantiatedServantUtils } from '@fgo-planner/data-core';
import { useCallback, useEffect, useState } from 'react';
import { useForceUpdate } from '../../../hooks/utils/use-force-update.hook';

type SelectedServantsData<T extends InstantiatedServant> = {
    instanceIds: ReadonlySet<number>;
    servants: ReadonlyArray<T>
};

class SelectedServantsDataContainer<T extends InstantiatedServant> implements SelectedServantsData<T> {

    selectedServants?: ReadonlyArray<T>;

    selectedInstanceIds: ReadonlySet<number> = CollectionUtils.emptySet();

    get instanceIds(): ReadonlySet<number> {
        return this.selectedInstanceIds;
    }

    /**
     * Lazy fetches the selected `MasterServant` objects. The servants are returned
     * in the order as the appear in the `sourceData` array.
     * 
     * TODO Add option to order by the `selectedInstanceIds` set.
     */
    get servants(): ReadonlyArray<T> {
        if (!this.selectedServants) {
            const selectedInstanceIds = this.selectedInstanceIds;
            this.selectedServants = this.sourceData.filter(({ instanceId }) => {
                return selectedInstanceIds.has(instanceId);
            });
        }
        return this.selectedServants!;
    }

    constructor(public sourceData: ReadonlyArray<T>) {

    }

}

type MasterServantsSelectedServantsHootResult<T extends InstantiatedServant> = {
    /**
     * Guaranteed to be stable between rerenders.
     */
    selectedServantsData: Readonly<SelectedServantsData<T>>;
    selectAllServants: () => void;
    deselectAllServants: () => void;
    updateSelectedServants: (selectedInstanceIds: ReadonlySet<number>) => void;
};

/**
 * Utility hook that manages servant instance selection.
 */
export const useSelectedServantInstances = <T extends InstantiatedServant>(
    sourceData: ReadonlyArray<T>
): MasterServantsSelectedServantsHootResult<T> => {

    const forceUpdate = useForceUpdate();

    const [selectedServantsData] = useState<SelectedServantsDataContainer<T>>(() => new SelectedServantsDataContainer<T>(sourceData));
    
    useEffect(() => {
        selectedServantsData.sourceData = sourceData;
        selectedServantsData.selectedServants = undefined;
    }, [selectedServantsData, sourceData]);

    const updateSelectedServants = useCallback((selectedInstanceIds: ReadonlySet<number>): void => {
        if (CollectionUtils.isSetsEqual(selectedInstanceIds, selectedServantsData.selectedInstanceIds)) {
            return;
        }
        selectedServantsData.selectedInstanceIds = selectedInstanceIds;
        selectedServantsData.selectedServants = undefined;
        forceUpdate();
    }, [forceUpdate, selectedServantsData]);

    const selectAllServants = useCallback((): void => {
        const allInstanceIds = selectedServantsData.sourceData.map(InstantiatedServantUtils.getInstanceId);
        updateSelectedServants(new Set(allInstanceIds));
    }, [selectedServantsData, updateSelectedServants]);

    const deselectAllServants = useCallback((): void => {
        updateSelectedServants(CollectionUtils.emptySet());
    }, [updateSelectedServants]);

    return {
        selectedServantsData,
        selectAllServants,
        deselectAllServants,
        updateSelectedServants
    };

};
