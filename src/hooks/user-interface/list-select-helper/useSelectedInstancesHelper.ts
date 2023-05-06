import { CollectionUtils } from '@fgo-planner/common-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SelectedData } from '../../../types';

type SelectedInstancesHelperHookResult<T, ID> = {
    /**
     * Guaranteed to be stable between re-renders.
     */
    selectedData: Readonly<SelectedData<T, ID>>;
    selectAll: () => void;
    deselectAll: () => void;
    updateSelection: (selectedIds: ReadonlySet<ID>) => void;
};

const computeSelectedData = <T, ID>(
    sourceData: ReadonlyArray<T>,
    selectedIds: ReadonlySet<ID>,
    getIdFunction: (value: T) => ID
): SelectedData<T, ID> => {
    const instances: Array<T> = [];
    const ids = new Set<ID>();
    for (const instance of sourceData) {
        const id = getIdFunction(instance);
        if (!selectedIds.has(id)) {
            continue;
        }
        instances.push(instance);
        ids.add(id);
    }
    return { ids, instances };
};


/**
 * Utility hook that tracks selected object references and their IDs.
 */
export function useSelectedInstancesHelper<T, ID = number>(
    sourceData: ReadonlyArray<T>,
    getIdFunction: (value: T) => ID
): SelectedInstancesHelperHookResult<T, ID> {

    const [selectedIds, setSelectedIds] = useState<ReadonlySet<ID>>(CollectionUtils.emptySet);
    const [selectedInstances, setSelectedInstances] = useState<ReadonlyArray<T>>(CollectionUtils.emptyArray);

    const selectedDataRef = useRef<SelectedData<T, ID>>({
        ids: selectedIds,
        instances: selectedInstances
    });

    const sourceDataRef = useRef<ReadonlyArray<T>>(sourceData);
    sourceDataRef.current = sourceData;

    /**
     * Updates the selected IDs and instances if the source data reference changes.
     */
    useEffect(() => {
        setSelectedIds(selectedIds => {
            const updatedSelectedData = computeSelectedData(
                sourceData,
                selectedIds,
                getIdFunction
            );
            setSelectedInstances(updatedSelectedData.instances);
            return updatedSelectedData.ids;
        });
    }, [getIdFunction, sourceData]);

    const updateSelection = useCallback((selectedIds: ReadonlySet<ID>): void => {
        setSelectedIds(prevSelectedIds => {
            if (CollectionUtils.isSetsEqual(prevSelectedIds, selectedIds)) {
                return prevSelectedIds;
            }
            const updatedSelectedData = computeSelectedData(
                sourceDataRef.current,
                selectedIds,
                getIdFunction
            );
            setSelectedInstances(updatedSelectedData.instances);
            return updatedSelectedData.ids;
        });
    }, [getIdFunction]);

    const selectAll = useCallback((): void => {
        const allInstanceIds = sourceDataRef.current.map(getIdFunction);
        updateSelection(new Set(allInstanceIds));
    }, [getIdFunction, updateSelection]);

    const deselectAll = useCallback((): void => {
        updateSelection(CollectionUtils.emptySet());
    }, [updateSelection]);

    const selectedData = selectedDataRef.current;
    selectedData.ids = selectedIds;
    selectedData.instances = selectedInstances;

    return {
        selectedData,
        selectAll,
        deselectAll,
        updateSelection
    };

};
