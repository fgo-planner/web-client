import { MouseEvent, useCallback, useEffect, useRef } from 'react';
import { SetUtils } from '../../utils/set.utils';
import { useForceUpdate } from '../utils/use-force-update.hook';

export type ListSelectHelperHookOptions = {
    /**
     * Whether selection functionality is disabled.
     */
    disabled?: boolean;
    /**
     * Whether multiple selections are allowed.
     */
    multiple?: boolean;
    rightClickAction?: 'none' | 'select' | 'contextmenu';
};

type ListSelectHelperHookResult = {
    handleItemClick: (e: MouseEvent, index: number) => void;
    selectedIds: ReadonlySet<number>;
};

/**
 * Utility hook that handles the click events on a list and keeps track of which
 * items are selected based on the events.
 */
export const useListSelectHelper = <T>(
    sourceData: ReadonlyArray<T>,
    selectedIds: ReadonlySet<number>,
    getIdFunction: (value: T) => number,
    options: ListSelectHelperHookOptions = {}
): ListSelectHelperHookResult => {

    const forceUpdate = useForceUpdate();

    const {
        disabled,
        multiple,
        rightClickAction = 'none'
    } = options;

    const sourceDataRef = useRef<ReadonlyArray<T>>(sourceData);

    const lastClickIndexRef = useRef<number>();

    const selectedIdsRef = useRef<ReadonlySet<number>>(SetUtils.emptySet());

    /**
     * Updates the `selectedDataContainer` whenever the `sourceData` reference changes.
     */
    useEffect(() => {
        if (disabled) {
            return;
        }
        let hasChanges = false;
        if (!SetUtils.isEqual(selectedIds, selectedIdsRef.current)) {
            selectedIdsRef.current = selectedIds;
            hasChanges = true;
        }
        if (sourceData !== sourceDataRef.current) {
            sourceDataRef.current = sourceData;
            hasChanges = true;
        }
        if (!hasChanges) {
            return;
        }
        const updatedSelectedIds = new Set<number>();
        const updatedSelectedItems = [];
        for (const item of sourceDataRef.current) {
            const id = getIdFunction(item);
            if (selectedIdsRef.current.has(id)) {
                updatedSelectedIds.add(id);
                updatedSelectedItems.push(item);
            }
        }
        selectedIdsRef.current = updatedSelectedIds;
        forceUpdate();
    }, [disabled, sourceData, selectedIds, getIdFunction, forceUpdate]);

    const handleItemClick = useCallback((e: MouseEvent, index: number): void => {
        if (disabled) {
            return;
        }

        const isRightClick = e.type === 'contextmenu';

        /**
         * If the right button was clicked, and right click action is disallowed, then
         * just return.
         */
        if (isRightClick && rightClickAction === 'none') {
            return;
        }

        const sourceData = sourceDataRef.current;
        const selectedIds = selectedIdsRef.current;

        /**
         * The item that was clicked. Assumes that the index always exists.
         */
        const clickedItem = sourceData[index];
        /**
         * The ID of the item that was clicked.
         */
        const clickedItemId = getIdFunction(clickedItem);

        /**
         * Array containing the IDs of the updated selection.
         */
        const updatedSelectionIds: number[] = [];

        if (!multiple) {
            /**
             * For single select, there is no difference in behavior between left and right
             * click at this point. In addition, the only modifier key that has any effect
             * is the ctrl key.
             *
             * If the ctrl modifier key was pressed, and the clicked item was already
             * selected, then deselect it. Otherwise the behavior is the same as a normal
             * click.
             */
            if (!e.ctrlKey || !selectedIds.has(clickedItemId)) {
                updatedSelectionIds.push(clickedItemId);
            }
        } else {

            if (e.shiftKey) {
                /**
                 * If the shift modifier key was pressed, then do one of the following:
                 *
                 * - If a previous click index was recorded, then all of the items between that
                 *   index and the newly clicked index (inclusive) regardless of whether they
                 *   were already selected or not.
                 *
                 * - If a previous click was not recorded, then change the selection to just the
                 *   item that was clicked (same behavior as no modifier keys).
                 *
                 * Note that if both the shift and ctrl keys were pressed, then the shift key
                 * has precedence.
                 */
                const lastClickIndex = lastClickIndexRef.current;
                if (lastClickIndex === undefined) {
                    updatedSelectionIds.push(clickedItemId);
                } else {
                    if (selectedIds) {
                        updatedSelectionIds.push(...selectedIds);
                    }
                    if (lastClickIndex === index) {
                        updatedSelectionIds.push(clickedItemId);
                    } else {
                        const start = Math.min(lastClickIndex, index);
                        const end = Math.max(lastClickIndex, index);
                        for (let i = start; i <= end; i++) {
                            const itemId = getIdFunction(sourceData[i]);
                            updatedSelectionIds.push(itemId);
                        }
                    }
                }
            } else if (e.ctrlKey) {
                /**
                 * If the ctrl modifier key was pressed, then do one of the following:
                 *
                 * - If the clicked item was already selected, then deselect it.
                 *
                 * - If the clicked item was not selected, then add it to the selection.
                 */
                let alreadySelected = false;
                if (selectedIds) {
                    for (const instanceId of selectedIds) {
                        if (instanceId === clickedItemId) {
                            alreadySelected = true;
                        } else {
                            updatedSelectionIds.push(instanceId);
                        }
                    }
                }
                if (!alreadySelected) {
                    updatedSelectionIds.push(clickedItemId);
                }
            } else if (isRightClick && rightClickAction === 'contextmenu' && selectedIds.has(clickedItemId)) {
                /**
                 * If the right button was click AND the right click action is set to
                 * `contextmenu` AND the clicked item was already selected (either individually
                 * or part of a multiple selection), then just keep the current selection.
                 */
                updatedSelectionIds.push(...selectedIds);
            } else {
                /**
                 * If no modifier keys were pressed, then change the selection to just the
                 * item that was clicked.
                 */
                updatedSelectionIds.push(clickedItemId);
            }
        }

        /**
         * Update the last clicked row/item index.
         */
        lastClickIndexRef.current = index;
        /**
         * Update the `selectedIdsRef` and `selectedItems`.
         */
        const updatedSelectionIdSet = new Set(updatedSelectionIds);
        selectedIdsRef.current = updatedSelectionIdSet;
        
        forceUpdate();
    }, [disabled, forceUpdate, getIdFunction, multiple, rightClickAction]);


    return {
        handleItemClick,
        selectedIds: selectedIdsRef.current
    };

};
