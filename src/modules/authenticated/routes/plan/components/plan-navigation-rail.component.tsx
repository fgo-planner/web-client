import { Clear as ClearIcon, DeleteForeverOutlined as DeleteForeverOutlinedIcon, Done as DoneIcon, FormatSize as FormatSizeIcon, GroupAddOutlined, HideImageOutlined as HideImageOutlinedIcon, ModeEditOutlined as ModeEditOutlinedIcon, PersonAddAlt1Outlined as PersonAddAlt1OutlinedIcon, Reorder as ReorderIcon, ViewWeekOutlined as ViewWeekOutlinedIcon } from '@mui/icons-material';
import { Divider, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { NavigationRail } from '../../../../../components/navigation/navigation-rail/navigation-rail.component';

type Props = {
    dragDropMode: boolean;
    layout: 'row' | 'column';
    onAddServant: () => void;
    onMultiAddServant: () => void;
    onDeleteSelectedServants: () => void;
    onDragDropActivate: () => void;
    onDragDropApply: () => void;
    onDragDropCancel: () => void;
    onEditSelectedServants: () => void;
    onOpenDisplaySettings: () => void;
    onToggleCellSize: () => void;
    onToggleShowUnused: () => void;
    selectedServantsCount: number;
};

export const PlanNavigationRail = React.memo((props: Props) => {

    const {
        dragDropMode,
        layout,
        onAddServant,
        onMultiAddServant,
        onDeleteSelectedServants,
        onDragDropActivate,
        onDragDropApply,
        onDragDropCancel,
        onEditSelectedServants,
        onOpenDisplaySettings,
        onToggleCellSize,
        onToggleShowUnused,
        selectedServantsCount
    } = props;

    if (dragDropMode) {
        return (
            <NavigationRail border layout={layout}>
                <Tooltip key='apply' title='Apply order changes' placement='right'>
                    <div>
                        <IconButton
                            onClick={onDragDropApply}
                            children={<DoneIcon />}
                            size='large'
                        />
                    </div>
                </Tooltip>
                <Tooltip key='cancel' title='Cancel order changes' placement='right'>
                    <div>
                        <IconButton
                            color='warning'
                            onClick={onDragDropCancel}
                            children={<ClearIcon />}
                            size='large'
                        />
                    </div>
                </Tooltip>
            </NavigationRail>
        );
    }

    return (
        <NavigationRail border layout={layout}>
            {/* TODO Hide based on mobile browser instead of by breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='display' title='Display settings' placement='right'>
                    <div>
                        <IconButton
                            onClick={onOpenDisplaySettings}
                            children={<ViewWeekOutlinedIcon />}
                            size='large'
                        />
                    </div>
                </Tooltip>
            }
            <Divider />
            <Tooltip key='add' title='Add servant' placement='right'>
                <div>
                    <IconButton
                        onClick={onAddServant}
                        children={<PersonAddAlt1OutlinedIcon />}
                        size='large'
                    />
                </div>
            </Tooltip>
            <Tooltip key='multi-add' title='Add multiple servants (not available yet)' placement='right'>
                <div>
                    <IconButton
                        onClick={onMultiAddServant}
                        children={<GroupAddOutlined />}
                        size='large'
                        disabled
                    />
                </div>
            </Tooltip>
            {/* TODO Hide based on mobile browser instead of by breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='reorder' title='Reorder servants (not available yet)' placement='right'>
                    <div>
                        <IconButton
                            onClick={onDragDropActivate}
                            children={<ReorderIcon />}
                            size='large'
                            disabled
                        />
                    </div>
                </Tooltip>
            }
            <Tooltip key='edit' title='Edit selected' placement='right'>
                <div>
                    <IconButton
                        onClick={onEditSelectedServants}
                        children={<ModeEditOutlinedIcon />}
                        size='large'
                        disabled={!selectedServantsCount}
                    />
                </div>
            </Tooltip>
            <Tooltip key='delete' title='Delete selected' placement='right'>
                <div>
                    <IconButton
                        color='error'
                        onClick={onDeleteSelectedServants}
                        children={<DeleteForeverOutlinedIcon />}
                        size='large'
                        disabled={!selectedServantsCount}
                    />
                </div>
            </Tooltip>
            <Divider />
            <Tooltip key='test' title='Test' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleCellSize}
                        children={<FormatSizeIcon />}
                        size='large'
                    />
                </div>
            </Tooltip>
            <Tooltip key='test2' title='Test 2' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleShowUnused}
                        children={<HideImageOutlinedIcon />}
                        size='large'
                    />
                </div>
            </Tooltip>
        </NavigationRail>
    );

});
