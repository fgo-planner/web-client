import { DragIndicator as DragIndicatorIcon, SvgIconComponent } from '@mui/icons-material';
import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, MouseEvent, PropsWithChildren, ReactNode, useCallback, useMemo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import listRowStyle from './list-row-style';

// TODO Add prop for cursor style.
type Props = PropsWithChildren<{
    active?: boolean;
    borderBottom?: boolean;
    borderTop?: boolean;
    draggableId: number;
    dragEnabled?: boolean;
    dragHandleIcon?: SvgIconComponent;
    dragHandleVisible?: boolean;
    index: number;
    onDragOrderChange?: (sourceId: number, destinationId: number) => void;
    // TODO Add option(s) to hide/disable drag handle.
}> & Omit<DOMAttributes<HTMLDivElement>, 'className'>;

type DragItem = {
    id: number;
    index: number;
};

// TODO Move this to a utilities file.
const handleDragHandleClick = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
};

const DragType = 'row';

const DefaultDragHandleIcon = DragIndicatorIcon;

export const StyleClassPrefix = 'DraggableListRowContainer';

const StyleOptions = {
    name: StyleClassPrefix
} as MuiStyledOptions;

const RootComponent = styled('div', StyleOptions)(({ theme }) => ({
    ...listRowStyle(theme),
    '&.draggable': {
        display: 'flex',
        alignItems: 'center'
    },
    '&.dragging': {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    [`& .${StyleClassPrefix}-drag-handle`]: {
        cursor: 'grab',
        margin: theme.spacing(0, -2, 0, 1),
        opacity: 0.5,
        '&.disabled': {
            cursor: 'initial',
            color: theme.palette.text.disabled
        }
    }
}));

export const DraggableListRowContainer = React.memo((props: Props)=>{

    const {
        active,
        borderBottom,
        borderTop,
        draggableId,
        dragEnabled,
        dragHandleIcon,
        dragHandleVisible,
        index,
        onDragOrderChange,
        children,
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

    const DragHandleIcon = dragHandleIcon ?? DefaultDragHandleIcon;

    const renderDragHandle = (): ReactNode => {
        if (!dragHandleVisible) {
            return null;
        }
        if (!dragEnabled) {
            return (
                <div className={clsx(`${StyleClassPrefix}-drag-handle`, 'disabled')}>
                    <DragHandleIcon />
                </div>
            );
        }
        return (
            <div
                ref={connectDrag}
                className={`${StyleClassPrefix}-drag-handle`}
                onClick={handleDragHandleClick}
            >
                <DragHandleIcon />
            </div>
        );
    };

    const classNames = clsx(
        'row',
        'draggable',
        isDragging && 'dragging',
        active && 'active',
        borderTop && 'border-top',
        borderBottom && 'border-bottom'
    );


    return (
        <RootComponent
            ref={dragRef}
            // data-handler-id={draggableId}
            className={classNames}
            {...domAttributes}
        >
            {renderDragHandle()}
            {children}
        </RootComponent>
    );

});
