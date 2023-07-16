import { Divider, Icon, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { IconOutlined } from '../../../../../components/icons/IconOutlined';
import { NavigationRail } from '../../../../../components/navigation/navigation-rail/NavigationRail';

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
    onMarkSelectedAsComplete: () => void;
    onOpenDisplaySettings: () => void;
    onToggleCellSize: () => void;
    onToggleRowheaderMode: () => void;
    onToggleShowUnused: () => void;
    selectedServantsCount: number;
};

export const PlanRouteNavigationRail = React.memo((props: Props) => {

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
        onMarkSelectedAsComplete,
        onOpenDisplaySettings,
        onToggleCellSize,
        onToggleRowheaderMode,
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
                            size='large'
                        >
                            <Icon>done</Icon>
                        </IconButton>
                    </div>
                </Tooltip>
                <Tooltip key='cancel' title='Cancel order changes' placement='right'>
                    <div>
                        <IconButton
                            color='warning'
                            onClick={onDragDropCancel}
                            size='large'
                        >
                            <Icon>clear</Icon>
                        </IconButton>
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
                            size='large'
                        >
                            <IconOutlined>view_week</IconOutlined>
                        </IconButton>
                    </div>
                </Tooltip>
            }
            <Divider />
            <Tooltip key='add' title='Add servant' placement='right'>
                <div>
                    <IconButton
                        onClick={onAddServant}
                        size='large'
                    >
                        <IconOutlined>person_add_alt_1</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
            <Tooltip key='multi-add' title='Add multiple servants (not available yet)' placement='right'>
                <div>
                    <IconButton
                        onClick={onMultiAddServant}
                        size='large'
                        disabled
                    >
                        <IconOutlined>group_add</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
            {/* TODO Hide based on mobile browser instead of by breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='reorder' title='Reorder servants (not available yet)' placement='right'>
                    <div>
                        <IconButton
                            onClick={onDragDropActivate}
                            size='large'
                        >
                            <Icon>reorder</Icon>
                        </IconButton>
                    </div>
                </Tooltip>
            }
            <Tooltip key='edit' title='Edit selected' placement='right'>
                <div>
                    <IconButton
                        onClick={onEditSelectedServants}
                        size='large'
                        disabled={!selectedServantsCount}
                    >
                        <IconOutlined>mode_edit</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
            <Tooltip key='mark-complete' title='Mark as complete' placement='right'>
                <div>
                    <IconButton
                        onClick={onMarkSelectedAsComplete}
                        size='large'
                        disabled={!selectedServantsCount}
                    >
                        <IconOutlined>how_to_reg</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
            <Tooltip key='delete' title='Delete selected' placement='right'>
                <div>
                    <IconButton
                        color='error'
                        onClick={onDeleteSelectedServants}
                        size='large'
                        disabled={!selectedServantsCount}
                    >
                        <IconOutlined>delete_forever</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
            <Divider />
            <Tooltip key='toggle-target-details' title='Toggle target details' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleRowheaderMode}
                        size='large'
                    >
                        <IconOutlined>data_object</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
            <Tooltip key='toggle-size' title='Toggle display size' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleCellSize}
                        size='large'
                    >
                        <IconOutlined>format_size</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
            <Tooltip key='toggle-empty-columns' title='Toggle empty columns' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleShowUnused}
                        size='large'
                    >
                        <IconOutlined>hide_image</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
        </NavigationRail>
    );

});
