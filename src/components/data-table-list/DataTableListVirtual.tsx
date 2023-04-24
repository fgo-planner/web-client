import React, { ReactNode, RefObject, useCallback, useEffect, useState } from 'react';
import { ComponentStyleProps } from '../../types';
import { DataTableListDropTargetIndicator } from './DataTableListDropTargetIndicator';

type Props<T> = {
    data: ReadonlyArray<T>;
    disableVirtualization?: boolean;
    /**
     * Displays the `DataTableListDropTargetIndicator` component before the row at
     * the given index. The indicator is hidden if `undefined`.
     */
    dropTargetIndex?: number;
    renderFunction: (data: T, index: number) => ReactNode;
    rowBufferCount?: number;
    rowHeight: number;
    scrollContainerRef: RefObject<HTMLElement>;
} & Pick<ComponentStyleProps, 'className'>;

const DefaultRowBufferCount = 5;

export const DataTableListVirtual = React.memo(<T,>(props: Props<T>) => {

    const {
        data,
        disableVirtualization,
        dropTargetIndex,
        renderFunction,
        rowBufferCount,
        rowHeight,
        scrollContainerRef,
        className
    } = props;

    const [initialized, setInitialized] = useState<boolean>(false);

    const [startIndex, setStartIndex] = useState<number>(0);

    const [renderedRowsCount, setRenderedRowsCount] = useState<number>(0);

    const computeVirtualProps = useCallback((element: Element): void => {
        const buffer = rowBufferCount || DefaultRowBufferCount;
        /**
         * Total rows rendered = leading buffer rows + actual visible rows + trailing
         * buffer rows
         */
        const renderedRowsCount = Math.ceil(element.clientHeight / rowHeight) + 2 * buffer;
        /**
         * Start index = start of actual visible rows - leading buffer rows
         */
        const startIndex = Math.max(Math.floor(element.scrollTop / rowHeight) - buffer, 0);
        setStartIndex(startIndex);
        setRenderedRowsCount(renderedRowsCount);
    }, [rowBufferCount, rowHeight]);

    useEffect(() => {
        if (disableVirtualization) {
            return;
        }

        const element = scrollContainerRef.current;
        if (!element) {
            return;
        }

        /**
         * Initial call.
         */
        if (!initialized) {
            computeVirtualProps(element);
            setInitialized(true);
        }

        /**
         * Bind handler for the `onscroll` event.
         */
        element.onscroll = (_: Event) => {
            computeVirtualProps(element);
        };

        /**
         * An observer for detecting resize events in the source element.
         */
        const resizeObserver = new ResizeObserver((entries: Array<ResizeObserverEntry>) => {
            const [entry] = entries;
            if (!entry) {
                return;
            }
            // entry.target should be the same as `element`.
            computeVirtualProps(entry.target);
        });

        /**
         * Bind the observer to the element.
         */
        resizeObserver.observe(element);

        /**
         * Return a function to clear all observations when the hook is re-triggered or
         * when the component is destroyed.
         */
        return () =>  {
            element.onscroll = null;
            resizeObserver.disconnect();
        };

    }, [computeVirtualProps, disableVirtualization, initialized, scrollContainerRef]);

    const renderRow = (elem: T, index: number): ReactNode => {
        if (dropTargetIndex === index) {
            return <>
                <DataTableListDropTargetIndicator key={-1} />
                {renderFunction(elem, index)}
            </>;
        }
        if (dropTargetIndex === data.length && index === data.length - 1) {
            return <>
                {renderFunction(elem, index)}
                <DataTableListDropTargetIndicator key={-1} />
            </>;
        }
        return renderFunction(elem, index);
    };

    // TODO Maybe create separate component for non-virtualized list.
    if (disableVirtualization) {
        return (
            <div className={className}>
                {data.map(renderRow)}
            </div>
        );
    }

    const renderVirtualRow = (elem: T, index: number): ReactNode => {
        if (index < startIndex || index > (startIndex + renderedRowsCount)) {
            return null;
        }
        return renderRow(elem, index);
    };

    /**
     * Total height of the leading rows.
     */
    const leadingRowsHeight = rowHeight * startIndex;

    return (
        <div className={className} style={{ height: rowHeight * data.length }}>
            <div style={{ transform: `translateY(${leadingRowsHeight}px)` }}>
                {data.map(renderVirtualRow)}
            </div>
        </div>
    );

}) as <T> (props: Props<T>) => JSX.Element;
