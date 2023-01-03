import { Icon } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { styled } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, PropsWithChildren, ReactNode, useCallback, useMemo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ComponentStyleProps, StyledFunctionProps } from '../../types';
import { EventHandlers } from '../../utils/event-handlers';
import { DataTableListBaseRowStyle } from './data-table-list-base-row.style';
import { DataTableListDraggableRowStyle, StyleClassPrefix } from './data-table-list-draggable-row.style';

// TODO Add prop for cursor style.
type Props = PropsWithChildren<{
    active?: boolean;
    borderBottom?: boolean;
    borderTop?: boolean;
    draggableId: number;
    dragEnabled?: boolean;
    dragHandleVisible?: boolean;
    index: number;
    onDragOrderChange?: (sourceId: number, destinationId: number) => void;
    // TODO Add option(s) to hide/disable drag handle.
    skipStyle?: boolean;
    stickyContent?: ReactNode;
    styleClassPrefix?: string;
}> & Pick<ComponentStyleProps, 'className' | 'style'> & DOMAttributes<HTMLDivElement>;

type DragItem = {
    id: number;
    index: number;
};

const handleDragHandleClick = EventHandlers.stopPropagation;

const DragType = 'row';

const shouldForwardProp = (prop: PropertyKey): prop is keyof StyledFunctionProps => (
    prop !== 'classPrefix' &&
    prop !== 'forRoot'
);

const StyledOptions = {
    skipSx: true,
    skipVariantsResolver: true,
    shouldForwardProp
} as FilteringStyledOptions<StyledFunctionProps>;

const RootComponent = styled('div', StyledOptions)<StyledFunctionProps>(
    DataTableListBaseRowStyle,
    DataTableListDraggableRowStyle
);

export const DataTableListDraggableRow = React.memo((props: Props) => {

    const {
        active,
        borderBottom,
        borderTop,
        draggableId,
        dragEnabled,
        dragHandleVisible,
        index,
        onDragOrderChange,
        skipStyle,
        stickyContent,
        styleClassPrefix = StyleClassPrefix,
        children,
        className,
        ...domAttributes
    } = props;

    /**
     * The ref to the entire row container. This is used as the preview image when
     * dragging a row as well as the drag hover/drop target.
     */
    const dragRef = useRef<HTMLDivElement>(null);

    const dragItem = useMemo((): DragItem => ({
        id: draggableId,
        index
    }), [draggableId, index]);

    const hover = useCallback(({ id: draggedId }: { id: number, index: number }) => {
        onDragOrderChange?.(draggedId, draggableId);
    }, [draggableId, onDragOrderChange]);

    const [{ isDragging }, connectDrag, previewDrag] = useDrag({
        type: DragType,
        item: dragItem,
        collect: (monitor) => {
            const result = {
                isDragging: monitor.isDragging()
            };
            return result;
        }
    });

    const [, connectDrop] = useDrop({
        accept: DragType,
        hover
    });

    /*
     * We use the entire row as the preview image as well as the drop target.
     */
    if (dragEnabled && dragHandleVisible) {
        previewDrag(dragRef);
        connectDrop(dragRef);
    }

    const renderDragHandle = (): ReactNode => {
        if (!dragHandleVisible) {
            return null;
        }
        if (!dragEnabled) {
            return (
                <div className={clsx(`${styleClassPrefix}-drag-handle`, 'disabled')}>
                    <Icon>drag_indicator</Icon>
                </div>
            );
        }
        return (
            <div
                ref={connectDrag}
                className={`${styleClassPrefix}-drag-handle`}
                onClick={handleDragHandleClick}
            >
                <Icon>drag_indicator</Icon>
            </div>
        );
    };

    const stickyContentNode: ReactNode = (
        <div className={`${styleClassPrefix}-sticky-content`}>
            {renderDragHandle()}
            {stickyContent}
        </div>
    );

    const classNames = clsx(
        className,
        `${styleClassPrefix}-root`,
        `${styleClassPrefix}-draggable`,
        isDragging && `${styleClassPrefix}-dragging`,
        active && `${styleClassPrefix}-active`,
        borderTop && `${styleClassPrefix}-border-top`,
        borderBottom && `${styleClassPrefix}-border-bottom`
    );

    if (skipStyle) {
        return (
            <div
                ref={dragRef}
                // data-handler-id={draggableId}
                className={classNames}
                {...domAttributes}
            >
                {stickyContentNode}
                {children}
            </div>
        );
    }

    return (
        <RootComponent
            ref={dragRef}
            // data-handler-id={draggableId}
            className={classNames}
            classPrefix={styleClassPrefix}
            {...domAttributes}
        >
            {stickyContentNode}
            {children}
        </RootComponent>
    );

});
