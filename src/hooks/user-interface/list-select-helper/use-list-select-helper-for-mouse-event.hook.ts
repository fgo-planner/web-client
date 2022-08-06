import { MouseEvent, useCallback } from 'react';
import { ListSelectAction } from './list-select-action.type';
import { ListSelectHelperHookOptions, useListSelectHelper } from './use-list-select-helper.hook';

type RightClickAction =
    'none' | 
    'left-click' | 
    'contextmenu';

export type ListSelectHelperForMouseEventHookOptions = {
    rightClickAction?: RightClickAction;
} & ListSelectHelperHookOptions;

type ListSelectHelperForMouseEventHookResult = {
    handleItemClick: (e: MouseEvent, index: number) => void;
    selectedIds: ReadonlySet<number>;
};

/**
 * Mapping of mouse button and modifier keys combinations to `ListSelectAction`
 * values:
 * 
 * - Shift => `continuous`
 * - Ctrl => `invert-target`
 * - Right click with `contextmenu` action => `append-target`
 * - Anything else => `override`
 * 
 * Note that if both the shift and ctrl keys were pressed, then the shift key
 * has precedence.
 */
const mapMouseEventToListSelectAction = (e: MouseEvent, rightClickAction: RightClickAction): ListSelectAction | null => {
    const isRightClick = e.type === 'contextmenu';
    if (isRightClick) {
        if (rightClickAction === 'none') {
            return null;
        }
        if (rightClickAction === 'contextmenu') {
            return 'append-target';
        }
    }
    if (e.shiftKey) {
        return 'continuous';
    }
    if (e.ctrlKey) {
        return 'invert-target';
    }
    return 'override';
};

/**
 * Utility hook that handles `MouseEvent` inputs on a list and keeps track of
 * which items are selected based on the events. Uses the `useListSelectHelper`
 * hook internally. Performs automatic conversion of `MouseEvent` inputs to
 * `ListSelectAction`. 
 */
export const useListSelectHelperForMouseEvent = <T>(
    sourceData: ReadonlyArray<T>,
    selectedIds: ReadonlySet<number>,
    getIdFunction: (value: T) => number,
    options: ListSelectHelperForMouseEventHookOptions = {}
): ListSelectHelperForMouseEventHookResult => {

    const {
        rightClickAction = 'none',
        ...delegatedOptions
    } = options;

    const {
        handleItemAction,
        selectedIds: selectedIdsResult
    } = useListSelectHelper(
        sourceData,
        selectedIds,
        getIdFunction,
        delegatedOptions
    );

    const handleItemClick = useCallback((e: MouseEvent, index: number): void => {
        const action = mapMouseEventToListSelectAction(e, rightClickAction);
        if (!action) {
            return;
        }
        handleItemAction(action, index);
    }, [handleItemAction, rightClickAction]);

    return {
        selectedIds: selectedIdsResult,
        handleItemClick
    };

};
