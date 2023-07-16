import { Divider, Icon, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { IconOutlined } from '../../../../../components/icons/IconOutlined';
import { NavigationRail } from '../../../../../components/navigation/navigation-rail/NavigationRail';

type Props = {
    filtersEnabled: boolean;
    hasSelection: boolean;
    layout: 'row' | 'column';
    onCreatePlan(): void;
    onCreatePlanGroup(): void;
    onDeleteSelectedPlan(): void;
    onEditSelectedPlan?(): void;
    onOpenColumnSettings?(): void;
    onToggleFilters(): void;
};

export const PlansRouteNavigationRail = React.memo((props: Props) => {

    const {
        filtersEnabled,
        hasSelection,
        layout,
        onCreatePlan,
        onCreatePlanGroup,
        onDeleteSelectedPlan,
        onEditSelectedPlan,
        onOpenColumnSettings,
        onToggleFilters
    } = props;

    return (
        <NavigationRail border layout={layout}>
            <Tooltip key='filters' title='Toggle filters' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleFilters}
                        size='large'
                        color={filtersEnabled ? 'primary' : undefined}
                        disabled  // Temporary
                    >
                        {filtersEnabled ?
                            <Icon>filter_alt</Icon> :
                            <IconOutlined>filter_alt</IconOutlined>
                        }
                    </IconButton>
                </div>
            </Tooltip>
            {/* TODO Hide based on mobile browser instead of by breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='columns' title='Column settings' placement='right'>
                    <div>
                        <IconButton
                            onClick={onOpenColumnSettings}
                            size='large'
                            disabled  // Temporary
                        >
                            <IconOutlined>view_week</IconOutlined>
                        </IconButton>
                    </div>
                </Tooltip>
            }
            <Divider />
            {/* This one is fine to hide based on breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='add' title='Create plan' placement='right'>
                    <div>
                        <IconButton
                            onClick={onCreatePlan}
                            size='large'
                        >
                            <IconOutlined>post_add</IconOutlined>
                        </IconButton>
                    </div>
                </Tooltip>
            }
            {/* This one is fine to hide based on breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='add-group' title='Create plan group' placement='right'>
                    <div>
                        <IconButton
                            onClick={onCreatePlanGroup}
                            size='large'
                        >
                            <IconOutlined>create_new_folder</IconOutlined>
                        </IconButton>
                    </div>
                </Tooltip>
            }
            <Tooltip key='edit' title='Rename selected' placement='right'>
                <div>
                    <IconButton
                        onClick={onEditSelectedPlan}
                        size='large'
                        disabled={!hasSelection}
                    >
                        <IconOutlined>drive_file_rename_outline</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
            <Tooltip key='delete' title='Delete selected' placement='right'>
                <div>
                    <IconButton
                        color='error'
                        onClick={onDeleteSelectedPlan}
                        size='large'
                        disabled={!hasSelection}
                    >
                        <IconOutlined>delete_forever</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
        </NavigationRail>
    );

});
