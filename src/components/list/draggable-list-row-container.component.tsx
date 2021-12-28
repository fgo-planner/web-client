import { DragIndicator as DragIndicatorIcon, SvgIconComponent } from '@mui/icons-material';
import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import listRowStyle from './list-row-style';

// TODO Add prop for cursor style.
type Props = PropsWithChildren<{
    classes?: any;
    active?: boolean;
    borderTop?: boolean;
    borderBottom?: boolean;
    draggableId: string;
    index: number;
    dragHandleIcon?: SvgIconComponent;
    // TODO Add option(s) to hide/disable drag handle.
}>;

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
        opacity: 0.5
    }
}));

export const DraggableListRowContainer = React.memo((props: Props) => {

    const {
        children,
        draggableId,
        index,
        dragHandleIcon,
        active,
        borderTop,
        borderBottom,
    } = props;

    const DragHandleIcon = dragHandleIcon ?? DefaultDragHandleIcon;

    return (
        <Draggable draggableId={draggableId} key={draggableId} index={index}>
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
                        {...provided.draggableProps}
                        className={classNames}
                    >
                        <div {...provided.dragHandleProps} className={`${StyleClassPrefix}-drag-handle`}>
                            <DragHandleIcon />
                        </div>
                        {children}
                    </RootComponent>
                );
            }}
        </Draggable>
    );

});
