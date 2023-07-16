import { CollectionUtils } from '@fgo-planner/common-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ListSelectAction } from './ListSelectAction.type';

export type MultiSelectHelperHookOptions<ID> = {
    /**
     * Whether selection functionality is disabled.
     */
    disabled?: boolean;
    /**
     * Set of IDs that may be present in the list but are not selectable.
     */
    disabledIds?: ReadonlySet<ID>;
};

type MultiSelectHelperHookResult<ID> = {
    handleItemAction: (action: ListSelectAction, index: number) => void;
    /**
     * Readonly set of the selected IDs.
     */
    selectionResult: ReadonlySet<ID>;
};

/**
 * Removes all the unselectable IDs from the given set.
 */
const removeUnselectableIds = <ID>(selectedIds: Set<ID>, disabledIds?: ReadonlySet<ID>): void => {
    if (!disabledIds) {
        return;
    }
    CollectionUtils.removeAll(selectedIds, disabledIds);
};

/**
 * Utility hook that handles the select actions on a list and keeps track of
 * which items are selected based on the events.
 */
export function useMultiSelectHelper<T, ID = number>(
    sourceData: ReadonlyArray<T>,
    selectedIds: ReadonlySet<ID>,
    getIdFunction: (value: T) => ID,
    options: MultiSelectHelperHookOptions<ID> = {}
): MultiSelectHelperHookResult<ID> {

    const {
        disabled,
        disabledIds
    } = options;

    const [selectionResult, setSelectionResult] = useState<ReadonlySet<ID>>(selectedIds);

    /**
     * Keeps track of the current source data.
     */
    const sourceDataRef = useRef<ReadonlyArray<T>>(sourceData);

    /**
     * Keeps track of the current disabled IDs.
     */
    const [, setDisabledIds] = useState<ReadonlySet<ID> | undefined>(disabledIds);

    /**
     * Keeps track of the previous selection target's ID.
     */
    const [, setPreviousTargetId] = useState<ID>();

    /**
     * Updates the `selectedIdsRef` whenever the input params change.
     */
    useEffect(() => {
        if (disabled) {
            return;
        }
        setSelectionResult(previousSelectionResult => {
            if (!CollectionUtils.isSetsEqual(selectedIds, previousSelectionResult)) {
                /**
                 * The only way this can change is if the value of the `selected` prop does not
                 * match the one returned by the hook in the previous render. As such, we will
                 * also reset the previous target ID.
                 */
                setPreviousTargetId(undefined);
                return selectedIds;
            }
            return previousSelectionResult;
        });
        if (sourceData !== sourceDataRef.current) {
            sourceDataRef.current = sourceData;
            setSelectionResult(previousSelectionResult => {
                const updatedSelectedIds = new Set<ID>();
                for (const item of sourceData) {
                    const id = getIdFunction(item);
                    if (previousSelectionResult.has(id)) {
                        updatedSelectedIds.add(id);
                    }
                }
                return updatedSelectedIds;
            });
        }
    }, [disabled, sourceData, getIdFunction, selectedIds]);

    useEffect(() => {
        if (disabled) {
            return;
        }
        setDisabledIds(previousDisabledIds => {
            const emptySet = CollectionUtils.emptySet();
            // TODO This statement is ugly...rewrite it.
            if (CollectionUtils.isSetsEqual(disabledIds || emptySet, previousDisabledIds || emptySet)) {
                return previousDisabledIds;
            }
            setSelectionResult(previousSelectionResult => {
                const updatedSelectedIds = new Set<ID>([...previousSelectionResult]);
                removeUnselectableIds(updatedSelectedIds, disabledIds);
                if (CollectionUtils.isSetsEqual(updatedSelectedIds, previousSelectionResult)) {
                    return previousSelectionResult;
                }
                return updatedSelectedIds;
            });
            return disabledIds;
        });
    }, [disabled, disabledIds]);

    const handleItemAction = useCallback((action: ListSelectAction, index: number): void => {
        if (disabled) {
            return;
        }
        const sourceData = sourceDataRef.current;
        /**
         * The target item. Assumes that the index always exists.
         */
        const targetItem = sourceData[index];
        /**
         * The ID of the target item.
         */
        const targetItemId = getIdFunction(targetItem);

        setPreviousTargetId(previousTargetId => {

            setSelectionResult(previousSelectionResult => {
                /**
                 * Array containing the IDs of the updated selection.
                 */
                const updatedSelectedIds: Array<ID> = [];

                if (action === 'continuous') {
                    /**
                     * If action is `continuous`, then look for the index of the previous action
                     * target based and do one of the following:
                     *
                     * - If a previous target ID was recorded, then all of the items between that
                     *   index and the target index index (inclusive) regardless of whether they
                     *   were already selected or not.
                     *
                     * - If a previous target index was not recorded, then change the selection to
                     *   just the target item (same behavior as `override`).
                     */
                    let previousTargetIndex = -1;
                    if (previousTargetId !== undefined) {
                        previousTargetIndex = sourceData.findIndex(item => getIdFunction(item) === previousTargetId);
                    }
                    if (previousTargetIndex === -1) {
                        updatedSelectedIds.push(targetItemId);
                    } else {
                        if (previousSelectionResult) {
                            updatedSelectedIds.push(...previousSelectionResult);
                        }
                        if (previousTargetIndex === index) {
                            updatedSelectedIds.push(targetItemId);
                        } else {
                            const start = Math.min(previousTargetIndex, index);
                            const end = Math.max(previousTargetIndex, index);
                            for (let i = start; i <= end; i++) {
                                const itemId = getIdFunction(sourceData[i]);
                                updatedSelectedIds.push(itemId);
                            }
                        }
                    }
                } else if (action === 'invert-target') {
                    /**
                     * If the action is `invert-target`, then do one of the following:
                     *
                     * - If the target item was already selected, then deselect it.
                     *
                     * - If the target item was not selected, then add it to the selection.
                     */
                    let alreadySelected = false;
                    if (previousSelectionResult) {
                        for (const instanceId of previousSelectionResult) {
                            if (instanceId === targetItemId) {
                                alreadySelected = true;
                            } else {
                                updatedSelectedIds.push(instanceId);
                            }
                        }
                    }
                    if (!alreadySelected) {
                        updatedSelectedIds.push(targetItemId);
                    }
                } else if (action === 'append-target' && previousSelectionResult.has(targetItemId)) {
                    /**
                     * If the action is `append-target` and the target item was already selected
                     * (either individually or part of a multiple selection), then just keep the
                     * current selection.
                     */
                    updatedSelectedIds.push(...previousSelectionResult);
                } else {
                    /**
                     * For the remaining actions/conditions, change the selection to just the target
                     * item.
                     */
                    updatedSelectedIds.push(targetItemId);
                }

                const updatedSelectionResult = new Set(updatedSelectedIds);
                removeUnselectableIds(updatedSelectionResult, disabledIds);
                return updatedSelectionResult;
            });

            /**
             * Update the previous target ID.
             */
            return targetItemId;
        });
    }, [disabled, getIdFunction, disabledIds]);

    return {
        handleItemAction,
        selectionResult
    };

}
