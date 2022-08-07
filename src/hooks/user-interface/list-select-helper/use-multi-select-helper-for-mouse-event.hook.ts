import { MouseEvent, useCallback } from 'react';
import { ListSelectAction } from './list-select-action.type';
import { MultiSelectHelperHookOptions, useMultiSelectHelper } from './use-multi-select-helper.hook';

type RightClickAction =
    'none' | 
    'left-click' | 
    'contextmenu';

export type MultiSelectHelperForMouseEventHookOptions = {
    rightClickAction?: RightClickAction;
} & MultiSelectHelperHookOptions;

type MultiSelectHelperForMouseEventHookResult<ID> = {
    handleItemClick: (e: MouseEvent, index: number) => void;
    selectedIds: ReadonlySet<ID>;
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
 * which items are selected based on the events. Uses the `useMultiSelectHelper`
 * hook internally. Performs automatic conversion of `MouseEvent` inputs to
 * `ListSelectAction`. 
 */
export function useMultiSelectHelperForMouseEvent<T, ID = number>(
    sourceData: ReadonlyArray<T>,
    selectedIds: ReadonlySet<ID>,
    getIdFunction: (value: T) => ID,
    options: MultiSelectHelperForMouseEventHookOptions = {}
): MultiSelectHelperForMouseEventHookResult<ID> {

    const {
        rightClickAction = 'none',
        ...delegatedOptions
    } = options;

    const {
        handleItemAction,
        selectedIds: selectedIdsResult
    } = useMultiSelectHelper<T, ID>(
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
