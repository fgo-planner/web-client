import { Divider, Icon, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { IconOutlined } from '../../../../../components/icons';
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
                            children={<Icon>done</Icon>}
                            size='large'
                        />
                    </div>
                </Tooltip>
                <Tooltip key='cancel' title='Cancel order changes' placement='right'>
                    <div>
                        <IconButton
                            color='warning'
                            onClick={onDragDropCancel}
                            children={<Icon>clear</Icon>}
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
                            children={<IconOutlined>view_week</IconOutlined>}
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
                        children={<IconOutlined>person_add_alt_1</IconOutlined>}
                        size='large'
                    />
                </div>
            </Tooltip>
            <Tooltip key='multi-add' title='Add multiple servants (not available yet)' placement='right'>
                <div>
                    <IconButton
                        onClick={onMultiAddServant}
                        children={<IconOutlined>group_add</IconOutlined>}
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
                            children={<Icon>reorder</Icon>}
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
                        children={<IconOutlined>mode_edit</IconOutlined>}
                        size='large'
                        disabled={!selectedServantsCount}
                    />
                </div>
            </Tooltip>
            <Tooltip key='mark-complete' title='Mark as complete' placement='right'>
                <div>
                    <IconButton
                        onClick={onMarkSelectedAsComplete}
                        children={<IconOutlined>how_to_reg</IconOutlined>}
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
                        children={<IconOutlined>delete_forever</IconOutlined>}
                        size='large'
                        disabled={!selectedServantsCount}
                    />
                </div>
            </Tooltip>
            <Divider />
            <Tooltip key='toggle-target-details' title='Toggle target details' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleRowheaderMode}
                        children={<IconOutlined>data_object</IconOutlined>}
                        size='large'
                    />
                </div>
            </Tooltip>
            <Tooltip key='toggle-size' title='Toggle display size' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleCellSize}
                        children={<IconOutlined>format_size</IconOutlined>}
                        size='large'
                    />
                </div>
            </Tooltip>
            <Tooltip key='toggle-empty-columns' title='Toggle empty columns' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleShowUnused}
                        children={<IconOutlined>hide_image</IconOutlined>}
                        size='large'
                    />
                </div>
            </Tooltip>
        </NavigationRail>
    );

});
