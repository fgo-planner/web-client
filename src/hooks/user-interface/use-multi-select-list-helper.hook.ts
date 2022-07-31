import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { SetUtils } from '../../utils/set.utils';
import { useForceUpdate } from '../utils/use-force-update.hook';

export type ListSelectHelperHookOptions = {
    disabled?: boolean;
    multiple?: boolean;
    onContextMenu?: (e: MouseEvent) => void;
    rightClickBehavior?: 'none' | 'mousedown' | 'contextmenu';
};

type SelectedData<T> = {
    readonly selectedIds: ReadonlySet<number>;
    readonly selectedItems: ReadonlyArray<T>;
    readonly selectedCount: number;
};

class SelectedDataContainer<T> implements SelectedData<T> {
    private _ids: ReadonlySet<number> = SetUtils.emptySet();
    get selectedIds() {
        return this._ids;
    }

    private _sourceData?: ReadonlyArray<T>;
    private _getIdFunction?: (value: T) => number;

    private _items?: ReadonlyArray<T>;
    get selectedItems() {
        // Lazy load selected items
        if (!this._items) {
            this._items = this._getSelectedItems();
        }
        return this._items!;
    }

    get selectedCount() {
        return this._ids.size;
    }

    update(
        getIdFunction:  (value: T) => number,
        sourceData?: ReadonlyArray<T>,
        selectedIds?: ReadonlySet<number>
    ) {
        let hasChanges = false;
        if (selectedIds && !SetUtils.isEqual(this._ids, selectedIds)) {
            this._ids = selectedIds;
            hasChanges = true;
        }
        if (sourceData && this._sourceData !== sourceData) {
            this._sourceData = sourceData;
            hasChanges = true;
        }
        if (this._getIdFunction !== getIdFunction) {
            this._getIdFunction = getIdFunction;
            hasChanges = true;
        }
        if (hasChanges) {
            this._items = undefined;  // Reset selected items
        }
    }

    /**
     * Builds an array containing only the selected items using the given IDs and
     * source data. This is called lazily to only build the items array when it is
     * requested.
     */
    private _getSelectedItems(): Array<T> {
        const getIdFunction = this._getIdFunction;
        if (!this._sourceData || !getIdFunction || !this._ids.size) {
            return [];
        } 
        return this._sourceData.filter(item => this._ids.has(getIdFunction(item)));
    }

};

type ListSelectHelperHookResult<T> = {
    /**
     * Guaranteed to be stable between rerenders.
     */
    selectedData: SelectedData<T>;
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
export const useListSelectHelper = <T>(
    sourceData: ReadonlyArray<T>,
    getIdFunction: (value: T) => number,
    options: ListSelectHelperHookOptions = {}
): ListSelectHelperHookResult<any> => {

    const forceUpdate = useForceUpdate();

    const {
        disabled,
        multiple,
        onContextMenu,
        rightClickBehavior = 'none',
    } = options;

    const sourceDataRef = useRef<ReadonlyArray<T>>(sourceData);

    /**
     * This will not change throughout the lifetime of the hook. However, we use a
     * state instead of ref to store this because refs cannot take an initializer
     * function for the default value. We do not want to unnecessarily construct a
     * new instance of `SelectedDataContainer` on every render.
     */
    const [selectedDataContainer] = useState<SelectedDataContainer<T>>(() => new SelectedDataContainer());

    const lastClickIndexRef = useRef<number>();

    /**
     * Updates the `selectedDataContainer` with the given source data and selected
     * IDs. Both parameters are optional; only the provided parameters will be
     * updated.
     */
    const updateSelectedDataContainer = useCallback((selectedIds?: ReadonlySet<number>, sourceData?: ReadonlyArray<T>): void => {
        selectedDataContainer.update(getIdFunction, sourceData, selectedIds);
        forceUpdate();
    }, [forceUpdate, getIdFunction, selectedDataContainer]);

    /**
     * Updates the `selectedDataContainer` whenever the `sourceData` reference changes.
     */
    useEffect(() => {
        if (disabled) {
            return;
        }
        sourceDataRef.current = sourceData;
        updateSelectedDataContainer(undefined, sourceData);
    }, [disabled, sourceData, updateSelectedDataContainer]);

    const selectAll = useCallback(() => {
        if (disabled) {
            return;
        }
        const sourceData = sourceDataRef.current;
        const updatedSelectionIds = sourceData.map(getIdFunction);

        updateSelectedDataContainer(new Set(updatedSelectionIds));
    }, [disabled, getIdFunction, updateSelectedDataContainer]);

    const selectNone = useCallback(() => {
        updateSelectedDataContainer(SetUtils.emptySet());
    }, [updateSelectedDataContainer]);

    const selectByIds = useCallback((itemIds: Array<number>, action: 'append' | 'overwrite' = 'overwrite') => {
        if (disabled) {
            return;
        }
        const { selectedIds } = selectedDataContainer;
        let updatedSelectionIds: Set<number>;
        if (action === 'append') {
            updatedSelectionIds = new Set([...selectedIds, ...itemIds]);
        } else {
            updatedSelectionIds = new Set(itemIds);
        }
        updateSelectedDataContainer(updatedSelectionIds);
    }, [disabled, selectedDataContainer, updateSelectedDataContainer]);

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
        const { selectedIds } = selectedDataContainer;

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
            } else if (shouldOpenContextMenu && selectedIds.has(clickedItemId)) {
                /**
                 * If the context menu is to be clicked, and the clicked item was already
                 * selected, then don't modify the selection. We want the context menu to apply
                 * to the current select.
                 */
                updatedSelectionIds.push(...selectedIds);
            } else {
                /*
                 * If no modifier keys were pressed, then change the selection to just the
                 * item that was clicked.
                 */
                updatedSelectionIds.push(clickedItemId);
            }
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
         * Update the last clicked row/item index.
         */
        lastClickIndexRef.current = index;
        /**
         * Update the `selectedDataContainer`.
         */
        updateSelectedDataContainer(new Set(updatedSelectionIds));

    }, [disabled, getIdFunction, multiple, onContextMenu, rightClickBehavior, selectedDataContainer, updateSelectedDataContainer]);


    return {
        selectedData: selectedDataContainer,
        selectAll,
        selectNone,
        selectByIds,
        handleItemClick
    };

};
