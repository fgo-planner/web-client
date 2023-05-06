import { ReactNode, RefObject, useCallback, useEffect, useState } from 'react';
import { ComponentStyleProps } from '../../types';

type Props<T> = {
    data: ReadonlyArray<T>;
    rowBuffer?: number;
    rowHeight: number;
    rowRenderFunction(data: T, index: number): ReactNode;
    scrollContainerRef: RefObject<HTMLElement>;
} & Pick<ComponentStyleProps, 'className'>;

const DefaultRowBufferCount = 5;

/**
 * Intended to be used internally by `DataTableList`. Do not use as standalone
 * component, use `DataTableList` instead with `virtual` prop set to `true`.
 */
export const DataTableListVirtual = <T,>(props: Props<T>): JSX.Element => {

    const {
        data,
        rowBuffer = DefaultRowBufferCount,
        rowHeight,
        rowRenderFunction,
        scrollContainerRef,
        className
    } = props;

    const [initialized, setInitialized] = useState<boolean>(false);

    const [startIndex, setStartIndex] = useState<number>(0);

    const [renderedRowsCount, setRenderedRowsCount] = useState<number>(0);

    const computeVirtualProps = useCallback((element: Element): void => {
        /**
         * Total rows rendered = leading buffer rows + actual visible rows + trailing
         * buffer rows
         */
        const renderedRowsCount = Math.ceil(element.clientHeight / rowHeight) + 2 * rowBuffer;
        /**
         * Start index = start of actual visible rows - leading buffer rows
         */
        const startIndex = Math.max(Math.floor(element.scrollTop / rowHeight) - rowBuffer, 0);
        setStartIndex(startIndex);
        setRenderedRowsCount(renderedRowsCount);
    }, [rowBuffer, rowHeight]);

    useEffect(() => {
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

    }, [computeVirtualProps, initialized, scrollContainerRef]);

    const renderVirtualRow = (elem: T, index: number): ReactNode => {
        if (index < startIndex || index > (startIndex + renderedRowsCount)) {
            return null;
        }
        return rowRenderFunction(elem, index);
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

};
