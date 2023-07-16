import React, { ReactNode, RefObject, useCallback } from 'react';
import { ComponentStyleProps } from '../../types';
import { DataTableDropTargetIndicator } from '../data-table/DataTableDropTargetIndicator';
import { DataTableListVirtual } from './DataTableListVirtual';

type VirtualListProps = {
    virtual?: false;
} | {
    virtual: true;
    /**
     * Height of each row in the list. Required for virtualized list.
     */
    rowHeight: number;
    /**
     * Reference to the scroll container element. Required for virtualized list.
     */
    scrollContainerRef: RefObject<HTMLElement>;
    /**
     * Number of rows to render as a buffer in the virtualized list.
     */
    virtualRowBuffer?: number;
};

type Props<T> = {
    data: ReadonlyArray<T>;
    /**
     * Displays the `DataTableDropTargetIndicator` component before the row at
     * the given index. The indicator is hidden if `undefined`.
     */
    dropTargetIndex?: number;
    rowRenderFunction(data: T, index: number): ReactNode;
    virtual?: boolean;
} & VirtualListProps & Pick<ComponentStyleProps, 'className'>;

export const DataTableList = React.memo(<T,>(props: Props<T>) => {

    const {
        data,
        dropTargetIndex,
        rowRenderFunction,
        virtual,
        className
    } = props;

    const renderRow = useCallback((elem: T, index: number): ReactNode => {
        if (dropTargetIndex === index) {
            return [
                <DataTableDropTargetIndicator key={-1} />,
                rowRenderFunction(elem, index)
            ];
        } else if (dropTargetIndex === data.length && index === data.length - 1) {
            return [
                rowRenderFunction(elem, index),
                <DataTableDropTargetIndicator key={-1} />
            ];
        } else {
            return rowRenderFunction(elem, index);
        }
    }, [data.length, dropTargetIndex, rowRenderFunction]);

    if (virtual) {

        const {
            virtualRowBuffer,
            rowHeight,
            scrollContainerRef
        } = props;

        return (
            <DataTableListVirtual
                className={className}
                data={data}
                rowBuffer={virtualRowBuffer}
                rowHeight={rowHeight}
                rowRenderFunction={renderRow}
                scrollContainerRef={scrollContainerRef}
            />
        );
    }

    return (
        <div className={className}>
            {data.map(renderRow)}
        </div>
    );

}) as <T> (props: Props<T>) => JSX.Element;
