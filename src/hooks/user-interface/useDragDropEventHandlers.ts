import { Functions } from '@fgo-planner/common-core';
import { DragEvent, RefObject, useCallback, useRef, useState } from 'react';

type DragDropResult = {
    destinationIndex: number;
    sourceIndex: number;
};

type DragDropEventHandlersHookResult = {
    destinationIndex: number | undefined;
    sourceIndex: number | undefined;
    /**
     * Handles the `onDragEnter` event of the container element.
     */
    handleDragEnter(event: DragEvent): void;
    /**
     * Handles the `onDragLeave` event of the container element.
     */
    handleDragLeave(event: DragEvent): void;
    /**
     * Handles the `onDragOver` event of the container element.
     */
    handleDragOver(event: DragEvent): void;
    /**
     * Handles the `onDragEnd` event of the row element.
     *
     * @returns The source and destination indices of the drag-drop operation.
     */
    handleRowDragEnd(event: DragEvent): DragDropResult;
    /**
     * Handles the `onDragStart` event of the row element.
     */
    handleRowDragStart(event: DragEvent, sourceIndex: number): void;
};

const parseIndexFromId = (prefix: string, id: string): number | undefined => {
    if (!id.startsWith(prefix)) {
        return undefined;
    }
    const index = Number.parseInt(id.substring(prefix.length));
    if (isNaN(index)) {
        return undefined;
    }
    return index;
};

/**
 * Computes the relative position of the mouse at the time the event occurred as
 * a percentage of the element's entire height.
 */
const computeVerticalPosition = (event: DragEvent, element: Element): number => {
    const { height, top } = element.getBoundingClientRect();
    return (event.clientY - top) / height;
};

/**
 * Amount of time after a `onDragLeave` event is trigger before registering it
 * as an actual leave.
 */
const LeaveDelay = 100;

export function useDragDropEventHandlers(
    rowElementIdPrefix: string,
    containerElementRef: RefObject<HTMLElement>
): DragDropEventHandlersHookResult {

    const [sourceIndex, setSourceIndex] = useState<number>();
    const [destinationIndex, setDestinationIndex] = useState<number>();

    const leaveDelayTimeoutRef = useRef<NodeJS.Timeout>();

    const handleRowDragStart = useCallback((_event: DragEvent, sourceIndex: number): void => {
        console.debug('Grabbed element at index', sourceIndex);
        setSourceIndex(sourceIndex);
    }, []);

    const handleRowDragEnd = useCallback((_event: DragEvent): DragDropResult => {
        const result: DragDropResult = {
            sourceIndex: 0,
            destinationIndex: 0
        };
        setSourceIndex(sourceIndex => {
            result.sourceIndex = sourceIndex || 0;
            setDestinationIndex(destinationIndex => {
                result.destinationIndex = destinationIndex ?? result.sourceIndex;
                if (result.destinationIndex > result.sourceIndex) {
                    result.destinationIndex -= 1;
                }
                return undefined;
            });
            return undefined;
        });
        console.debug('Moving from index', result.sourceIndex, 'to index', result.destinationIndex);
        return result;
    }, []);

    const handleDragEnter = Functions.identity; // Currently does nothing

    const handleDragLeave = useCallback((_event: DragEvent): void => {
        clearTimeout(leaveDelayTimeoutRef.current);
        leaveDelayTimeoutRef.current = setTimeout(() => {
            setDestinationIndex(undefined);
        }, LeaveDelay);
    }, []);

    const handleDragOver = useCallback((event: DragEvent): void => {
        clearTimeout(leaveDelayTimeoutRef.current);
        event.preventDefault();
        setDestinationIndex((previousDestinationIndex: number | undefined): number | undefined => {
            if (!containerElementRef.current) {
                return undefined;
            }
            let element = event.target as HTMLElement;
            while (true) {
                const index = parseIndexFromId(rowElementIdPrefix, element.id);
                if (index !== undefined) {
                    const verticalPosition = computeVerticalPosition(event, element);
                    if (verticalPosition > 0.5) {
                        return index + 1;
                    } else {
                        return index;
                    }
                }
                const nextElement = element.parentElement;
                if (!nextElement || nextElement === containerElementRef.current) {
                    return previousDestinationIndex;
                }
                element = nextElement;
            }
        });
    }, [containerElementRef, rowElementIdPrefix]);

    return {
        destinationIndex,
        sourceIndex,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleRowDragEnd,
        handleRowDragStart
    };

};
