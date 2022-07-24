import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { SetUtils } from '../../utils/set.utils';

export type MultiSelectListHelperHookOptions = {
    disabled?: boolean;
    onContextMenu?: (e: MouseEvent<HTMLDivElement>) => void;
    rightClickBehavior?: 'none' | 'mousedown' | 'contextmenu';
};

type SelectedData<T> = {
    ids: ReadonlySet<number>;
    items: ReadonlyArray<T>;
};

type MultiSelectListHelperHookResult<T> = {
    /**
     * Guaranteed to be stable between rerenders.
     */
    selectedData: Readonly<SelectedData<T>>;
    selectAll: () => void;
    selectNone: () => void;
    /**
     * @deprecated Currently unused.
     */
    selectByIds: (itemIds: Array<number>, action?: 'append' | 'overwrite') => void
    handleItemClick: (e: MouseEvent<HTMLDivElement>, index: number) => void;
};

/**
 * Utility hook that handles the click events on a list and keeps track of which
 * items are selected based on the events.
 */
export const useMultiSelectListHelper = <T>(
    sourceData: ReadonlyArray<T>,
    idTransformFunction: (value: T) => number,
    options: MultiSelectListHelperHookOptions = {}
): MultiSelectListHelperHookResult<any> => {

    const {
        disabled,
        onContextMenu,
        rightClickBehavior = 'none',
    } = options;
    
    const sourceDataRef = useRef<ReadonlyArray<T>>(sourceData);
    
    const [, setSelectedIds] = useState<ReadonlySet<number>>(SetUtils.emptySet());

    const [, setSelectedItems] = useState<Array<T>>([]);
    
    const selectedDataRef = useRef<SelectedData<T>>({ ids: SetUtils.emptySet(), items: [] });

    const lastClickIndexRef = useRef<number>();

    const updateSelectedDataRef = useCallback((ids: ReadonlySet<number>, items: Array<T>): void => {
        setSelectedIds(ids);
        setSelectedItems(items);
        selectedDataRef.current.ids = ids;
        selectedDataRef.current.items = items;
    }, []);

    /**
     * Rebuilds the `selectedItems` array using the current selected IDs and source
     * data.
     */
    const updateSelectedItems = useCallback((selectedItemIds: ReadonlySet<number>): Array<T> => {
        let updatedSelection: Array<T>;
        if (!selectedItemIds.size) {
            updatedSelection = [];
        } else {
            const sourceData = sourceDataRef.current;
            updatedSelection = sourceData.filter(item => selectedItemIds.has(idTransformFunction(item)));
        }
        return updatedSelection;
    }, [idTransformFunction]);

    /**
     * Updates the `selectedDataRef` whenever the `sourceData` reference changes.
     */
    useEffect(() => {
        if (disabled) {
            return;
        }
        sourceDataRef.current = sourceData;
        const selectedItemIds = selectedDataRef.current.ids;
        const updatedSelection = updateSelectedItems(selectedItemIds);
        updateSelectedDataRef(selectedItemIds, updatedSelection);
    }, [disabled, sourceData, updateSelectedDataRef, updateSelectedItems]);

    const selectAll = useCallback(() => {
        if (disabled) {
            return;
        }
        const sourceData = sourceDataRef.current;
        const updatedSelectionIds = sourceData.map(idTransformFunction);

        updateSelectedDataRef(new Set(updatedSelectionIds), [...sourceData]);
    }, [disabled, idTransformFunction, updateSelectedDataRef]);

    const selectNone = useCallback(() => {
        updateSelectedDataRef(new Set(), []);
    }, [updateSelectedDataRef]);

    const selectByIds = useCallback((itemIds: Array<number>, action: 'append' | 'overwrite' = 'overwrite') => {
        if (disabled) {
            return;
        }
        const selectedItemIds = selectedDataRef.current.ids;
        let updatedSelectionIds: Set<number>;
        if (action === 'append') {
            updatedSelectionIds = new Set([...selectedItemIds, ...itemIds]);
        } else {
            updatedSelectionIds = new Set(itemIds);
        }
        if (SetUtils.isEqual(updatedSelectionIds, selectedItemIds)) {
            return;
        }
        const updatedSelection = updateSelectedItems(updatedSelectionIds);
        updateSelectedDataRef(updatedSelectionIds, updatedSelection);
    }, [disabled, updateSelectedDataRef, updateSelectedItems]);

    const handleItemClick = useCallback((e: MouseEvent<HTMLDivElement>, index: number): void => {
        if (disabled) {
            return;
        }

        /**
         * Whether the right mouse button (contextmenu) was clicked.
         */
        const isRightClick = e.type === 'contextmenu';
        
        /**
         * If the right button was clicked, but the right click behavior is set to
         * `none`, then the event should be ignored.
         */
        if (isRightClick && rightClickBehavior === 'none') {
            return;
        }

        /**
         * Whether the the current event should trigger the opening of the context menu.
         */
        const shouldOpenContextMenu = isRightClick && rightClickBehavior === 'contextmenu';

        const sourceData = sourceDataRef.current;
        const selectedItemIds = selectedDataRef.current.ids;

        /**
         * The item that was clicked. Assumes that the index always exists.
         */
        const clickedItem = sourceData[index];
        /**
         * The ID of the item that was clicked.
         */
        const clickedItemId = idTransformFunction(clickedItem);

        /**
         * Array containing the IDs of the updated selection.
         */
        const updatedSelectionIds: number[] = [];

        if (e.shiftKey) {
            /*
             * If the shift modifier key was pressed, then do one of the following:
             * 
             * - If a previous click index was recorded, then all all the servants between
             *   that index and the newly clicked index (inclusive) regardless of whether
             *   they were already selected or not.
             * 
             * - If a previous click was not recorded, then change the selection to just the
             *   servant that was clicked (same behavior as no modifier keys).
             *
             * Note that if both the shift and ctrl keys were pressed, then the shift key
             * has precedence.
             */
            const lastClickIndex = lastClickIndexRef.current;
            if (lastClickIndex === undefined) {
                updatedSelectionIds.push(clickedItemId);
            } else {
                if (selectedItemIds) {
                    updatedSelectionIds.push(...selectedItemIds);
                }
                if (lastClickIndex === index) {
                    updatedSelectionIds.push(clickedItemId);
                } else {
                    const start = Math.min(lastClickIndex, index);
                    const end = Math.max(lastClickIndex, index);
                    for (let i = start; i <= end; i++) {
                        const itemId = idTransformFunction(sourceData[i]);
                        updatedSelectionIds.push(itemId);
                    }
                }
            }
        } else if (e.ctrlKey) {
            /*
             * If the ctrl modifier key was pressed, then do one of the following:
             *
             * - If the clicked servant was already selected, then deselect it.
             *
             * - If the clicked servant was not selected, then add it to the selection.
             */
            let alreadySelected = false;
            if (selectedItemIds) {
                for (const instanceId of selectedItemIds) {
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
        } else if (shouldOpenContextMenu && selectedItemIds.has(clickedItemId)) {
            /**
             * If the context menu is to be clicked, and the clicked servant was already
             * selected, then don't modify the selection. We want the context menu to apply
             * to the current select.
             */
            updatedSelectionIds.push(...selectedItemIds);
        } else {
            /*
             * If no modifier keys were pressed, then change the selection to just the
             * servant that was clicked.
             */
            updatedSelectionIds.push(clickedItemId);
        }

        /**
         * If the context menu is to be opened, then notify the parent to open the
         * context menu.
         */
        if (shouldOpenContextMenu) {
            e.preventDefault();
            onContextMenu?.(e);
        }

        /**
         * Update the last clicked row/servant index.
         */
        lastClickIndexRef.current = index;
        /**
         * Update the `selectedDataRef`.
         */
        const updatedSelectionIdSet = new Set(updatedSelectionIds);
        const updatedSelection = updateSelectedItems(updatedSelectionIdSet);
        updateSelectedDataRef(updatedSelectionIdSet, updatedSelection);

    }, [disabled, idTransformFunction, onContextMenu, rightClickBehavior, updateSelectedDataRef, updateSelectedItems]);


    return {
        selectedData: selectedDataRef.current,
        selectAll,
        selectNone,
        selectByIds,
        handleItemClick
    };

};
