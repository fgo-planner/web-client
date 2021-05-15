import { makeStyles, Theme } from '@material-ui/core';
import { StyleRules, WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { DragIndicator as DragIndicatorIcon, SvgIconComponent } from '@material-ui/icons';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import listRowStyle from './list-row-style';

type Props = PropsWithChildren<{
    classes?: any;
    borderTop?: boolean;
    borderRight?: boolean;
    borderBottom?: boolean;
    borderLeft?: boolean;
    draggableId: string;
    index: number;
    dragHandleIcon?: SvgIconComponent;
    // TODO Add option(s) to hide/disable drag handle.
}>;

const DefaultDragHandleIcon = DragIndicatorIcon;

const style = (theme: Theme) => ({
    ...listRowStyle(theme),
    draggable: {
        display: 'flex',
        alignItems: 'center'
    },
    dragging: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    dragHandle: {
        margin: theme.spacing(0, -2, 0, 1),
        opacity: 0.5
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'DraggableListRowContainer'
};

const useStyles = makeStyles(style, styleOptions);

export const DraggableListRowContainer = React.memo((props: Props) => {

    const {
        children,
        draggableId,
        index,
        dragHandleIcon,
        borderTop,
        borderRight,
        borderBottom,
        borderLeft
    } = props;

    const classes = useStyles(props);

    const DragHandleIcon = dragHandleIcon ?? DefaultDragHandleIcon;

    return (
        <Draggable draggableId={draggableId} index={index}>
            {(provided, snapshot) => {
                const className = clsx(
                    classes.row,
                    classes.draggable,
                    snapshot.isDragging && classes.dragging,
                    borderTop && classes.borderTop,
                    borderRight && classes.borderRight,
                    borderBottom && classes.borderBottom,
                    borderLeft && classes.borderLeft
                );
                return (
                    <div ref={provided.innerRef} {...provided.draggableProps} className={className}>
                        <div {...provided.dragHandleProps} className={classes.dragHandle}>
                            <DragHandleIcon />
                        </div>
                        {children}
                    </div>
                );
            }}
        </Draggable>
    );

});
