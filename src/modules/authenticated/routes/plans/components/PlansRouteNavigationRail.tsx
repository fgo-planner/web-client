import { Divider, Icon, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { IconOutlined } from '../../../../../components/icons';
import { NavigationRail } from '../../../../../components/navigation/navigation-rail/NavigationRail';

type Props = {
    filtersEnabled: boolean;
    hasSelection: boolean;
    layout: 'row' | 'column';
    onAddPlan: () => void;
    onDeleteSelectedPlan: () => void;
    onEditSelectedPlan?: () => void;
    onOpenColumnSettings?: () => void;
    onToggleFilters: () => void;
};

export const PlansRouteNavigationRail = React.memo((props: Props) => {

    const {
        filtersEnabled,
        hasSelection,
        layout,
        onAddPlan,
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
                        children={filtersEnabled ?
                            <Icon>filter_alt</Icon> :
                            <IconOutlined>filter_alt</IconOutlined>
                        }
                        size='large'
                        color={filtersEnabled ? 'primary' : undefined}
                    />
                </div>
            </Tooltip>
            {/* TODO Hide based on mobile browser instead of by breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='columns' title='Column settings' placement='right'>
                    <div>
                        <IconButton
                            onClick={onOpenColumnSettings}
                            children={<IconOutlined>view_week</IconOutlined>}
                            size='large'
                        />
                    </div>
                </Tooltip>
            }
            <Divider />
            {/* This one is fine to hide based on breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='add' title='Create plan' placement='right'>
                    <div>
                        <IconButton
                            onClick={onAddPlan}
                            children={<IconOutlined>post_add</IconOutlined>}
                            size='large'
                        />
                    </div>
                </Tooltip>
            }
            <Tooltip key='edit' title='Rename selected' placement='right'>
                <div>
                    <IconButton
                        onClick={onEditSelectedPlan}
                        children={<IconOutlined>drive_file_rename_outline</IconOutlined>}
                        size='large'
                        disabled={!hasSelection}
                    />
                </div>
            </Tooltip>
            <Tooltip key='delete' title='Delete selected' placement='right'>
                <div>
                    <IconButton
                        color='error'
                        onClick={onDeleteSelectedPlan}
                        children={<IconOutlined>delete_forever</IconOutlined>}
                        size='large'
                        disabled={!hasSelection}
                    />
                </div>
            </Tooltip>
        </NavigationRail>
    );

});
