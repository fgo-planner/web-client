import { CollectionUtils } from '@fgo-planner/common-core';
import { useCallback, useState } from 'react';

type DragDropHelperHookResult<T> = {
    /**
     * Contains a shallow clone of the source data array if drag-drop mode is
     * active; otherwise will be `undefined`. A new array instance will be created
     * whenever the order is changed.
     */
    dragDropData: Array<T> | undefined;
    /**
     * Activates drag-drop mode with given source data.
     */
    startDragDrop: (sourceData: ReadonlyArray<T>) => void;
    /**
     * Terminates drag-drop mode and returns an array of the IDs in the updated
     * order. The `dragDropData` array is also reset to `undefined`.
     *
     * @return An array of the IDs in the updated order, or `undefined` if
     * called while drag-drop mode is not active.
     */
    endDragDrop: () => Array<T> | undefined;
    /**
     * Moves the element with at the source index to the destination index.
     */
    handleDragOrderChange: (sourceIndex: number, destinationIndex: number) => void;
};

/**
 * Keeps track of the data state while drag-drop mode is active. Assumes the
 * data itself is not modified (other than the order) until the drag-drop
 * operation is terminated (applied or cancelled).
 */
export const useDragDropState = <T>(): DragDropHelperHookResult<T> => {

    const [dragDropData, setDragDropData] = useState<Array<T>>();

    const startDragDrop = useCallback((sourceData: ReadonlyArray<T>): void => {
        const dragDropData = [...sourceData];
        setDragDropData(dragDropData);
    }, []);

    const endDragDrop = useCallback((): Array<T> | undefined => {
        const resultContainer: { result?: Array<T> } = {};
        setDragDropData((dragDropData: Array<T> | undefined): undefined => {
            if (dragDropData) {
                resultContainer.result = dragDropData;
            }
            return undefined;
        });
        return resultContainer.result;
    }, []);

    const handleDragOrderChange = useCallback((sourceIndex: number, destinationIndex: number): void => {
        setDragDropData((dragDropData: Array<T> | undefined): Array<T> | undefined => {
            if (!dragDropData?.length) {
                return dragDropData;
            }
            if (sourceIndex === destinationIndex) {
                return dragDropData;
            }
            return CollectionUtils.moveElement([...dragDropData], sourceIndex, destinationIndex);
        });
    }, []);

    return {
        dragDropData,
        startDragDrop,
        endDragDrop,
        handleDragOrderChange
    };

};
