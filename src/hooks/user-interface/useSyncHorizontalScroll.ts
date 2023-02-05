import { UIEvent, UIEventHandler, useCallback, useEffect, useRef } from 'react';


export type ScrollSyncAction = (element: Element, scrollLeft: number) => void;

/**
 * @param sourceElement The `Element` to track for `scrollLeft` changes.
 * @param action A callback function that is invoked when the `scrollLeft`
 * property of the `sourceElement` changes.
 * 
 * @deprecated Current not in use.
 */
export const useSyncHorizontalScroll = (
    sourceElement: HTMLElement | null,
    actionCallback: ScrollSyncAction
): UIEventHandler<HTMLDivElement> => {

    /**
     * Holds the `actionCallback` passed into the hook. It is stored in a ref to
     * allow passing of different instances of the function without triggering the
     * downstream hooks.
     */
    const actionCallbackRef = useRef(actionCallback);

    /*
     * Updates the `actionCallbackRef` with the latest value if it has changed.
     */
    useEffect(() => {
        actionCallbackRef.current = actionCallback;
    }, [actionCallback]);

    /**
     * Contains the last known `scrollLeft` value of the source element.
     */
    const scrollLeftRef = useRef<number>();

    /*
     * Updates the `scrollLeftRef` if the `sourceElement` instance has changed.
     */
    useEffect(() => {
        scrollLeftRef.current = sourceElement?.scrollLeft;
    }, [sourceElement]);

    const applyHorizontalScroll = useCallback((element: Element): void => {
        const { scrollLeft } = element;
        if (scrollLeft === scrollLeftRef.current) {
            return;
        }
        scrollLeftRef.current = scrollLeft;
        const { current: actionCallback } = actionCallbackRef;
        actionCallback(element, scrollLeft);
    }, []);

    /*
     * Binds an observer to update the `left` style property of the rows' scroll
     * container elements when horizontal scroll container is resized.
     */
    useEffect(() => {
        if (!sourceElement) {
            return;
        }

        /**
         * An observer for detecting resize events in the source element.
         */
        const resizeObserver = new ResizeObserver((entries: Array<ResizeObserverEntry>) => {
            const [entry] = entries;
            if (!entry) {
                return;
            }
            // entry.target should be the same as sourceElement
            applyHorizontalScroll(entry.target);
        });

        /*
         * Bind the observer tot he source element.
         */
        resizeObserver.observe(sourceElement);

        /*
         * Return a function to clear all observations when the hook is re-triggered or
         * when the component is destroyed.
         */
        return () => resizeObserver.disconnect();

    }, [sourceElement, applyHorizontalScroll]);

    const handleScroll = useCallback((event: UIEvent<HTMLDivElement>): void => {
        applyHorizontalScroll(event.target as HTMLElement);
    }, [applyHorizontalScroll]);

    return handleScroll;

};
