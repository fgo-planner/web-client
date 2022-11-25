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
    endDragDrop: () => Array<number> | undefined;
    /**
     * Handles the drag order change event from `react-dnd`. This should be
     * passed to the `DataTableListDraggableRow` or similar component.
     */
    handleDragOrderChange: (sourceId: number, destinationId: number) => void;
};

export const useDragDropHelper = <T>(getIdFunction: (value: T) => number): DragDropHelperHookResult<T> => {

    const [dragDropData, setDragDropData] = useState<Array<T>>();

    const startDragDrop = useCallback((sourceData: ReadonlyArray<T>): void => {
        const dragDropData = [...sourceData];
        setDragDropData(dragDropData);
    }, []);

    const endDragDrop = useCallback((): Array<number> | undefined => {
        const resultContainer: { result?: Array<number> } = {};
        setDragDropData((dragDropData: Array<T> | undefined): undefined => {
            if (dragDropData) {
                resultContainer.result = dragDropData.map(getIdFunction);
            }
            return undefined;
        });
        return resultContainer.result;
    }, [getIdFunction]);

    const handleDragOrderChange = useCallback((sourceId: number, destinationId: number): void => {
        setDragDropData((dragDropData: Array<T> | undefined): Array<T> | undefined => {
            if (!dragDropData?.length) {
                return dragDropData;
            }
            console.log(sourceId, destinationId);
            if (sourceId === destinationId) {
                return dragDropData;
            }
            const sourceIndex = dragDropData.findIndex((value: T) => getIdFunction(value) === sourceId);
            const destinationIndex = dragDropData.findIndex((value: T) => getIdFunction(value) === destinationId);
            const updatedDragDropData = CollectionUtils.moveElement([...dragDropData], sourceIndex, destinationIndex);
            return updatedDragDropData;
        });
    }, [getIdFunction]);

    return {
        dragDropData,
        startDragDrop,
        endDragDrop,
        handleDragOrderChange
    };

};
