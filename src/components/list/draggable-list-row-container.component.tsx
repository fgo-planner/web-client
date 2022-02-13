import { DragIndicator as DragIndicatorIcon, SvgIconComponent } from '@mui/icons-material';
import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, MouseEvent, PropsWithChildren, ReactNode } from 'react';
import { Draggable, DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import listRowStyle from './list-row-style';

// TODO Add prop for cursor style.
type Props = PropsWithChildren<{
    active?: boolean;
    borderBottom?: boolean;
    borderTop?: boolean;
    draggableId: string;
    dragEnabled?: boolean;
    dragHandleIcon?: SvgIconComponent;
    dragHandleVisible?: boolean;
    index: number;
    // TODO Add option(s) to hide/disable drag handle.
}> & DOMAttributes<HTMLDivElement>;

// TODO Move this to a utilities file.
const handleDragHandleClick = (e: MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation();
};

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
        margin: theme.spacing(0, -2, 0, 1),
        opacity: 0.5,
        '&.disabled': {
            color: theme.palette.text.disabled
        }
    }
}));

export const DraggableListRowContainer = React.memo((props: Props) => {

    const {
        active,
        borderBottom,
        borderTop,
        draggableId,
        dragEnabled,
        dragHandleIcon,
        dragHandleVisible,
        index,
        children,
        ...domAttributes
    } = props;

    const DragHandleIcon = dragHandleIcon ?? DefaultDragHandleIcon;

    const renderDragHandle = (dragHandleProps: DraggableProvidedDragHandleProps | undefined): ReactNode => {
        console.log("HELLO???", index);
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
                onClick={handleDragHandleClick}
                {...dragHandleProps}
                className={`${StyleClassPrefix}-drag-handle`}
            >
                <DragHandleIcon />
            </div>
        );
    };

    return (
        <Draggable
            index={index}
            key={draggableId}
            draggableId={draggableId}
            isDragDisabled={!dragEnabled || !dragHandleVisible}
        >
            {(provided, snapshot) => {
                const classNames = clsx(
                    'row',
                    'draggable',
                    snapshot.isDragging && 'dragging',
                    active && 'active',
                    borderTop && 'border-top',
                    borderBottom && 'border-bottom'
                );
                return (
                    <RootComponent
                        ref={provided.innerRef}
                        {...domAttributes}
                        {...provided.draggableProps}
                        className={classNames}
                    >
                        {renderDragHandle(provided.dragHandleProps)}
                        {children}
                    </RootComponent>
                );
            }}
        </Draggable>
    );

});
