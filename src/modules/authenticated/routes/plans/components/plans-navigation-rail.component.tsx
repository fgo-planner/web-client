import { DeleteForeverOutlined as DeleteForeverOutlinedIcon, DriveFileRenameOutline as DriveFileRenameOutlineIcon, FilterAlt as FilterAltIcon, FilterAltOutlined as FilterAltOutlinedIcon, PostAddOutlined as PostAddOutlinedIcon, ViewWeekOutlined as ViewWeekOutlinedIcon } from '@mui/icons-material';
import { Divider, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { NavigationRail } from '../../../../../components/navigation/navigation-rail/navigation-rail.component';

type Props = {
    filtersEnabled: boolean;
    layout: 'row' | 'column';
    onAddPlan: () => void;
    onDeleteSelectedPlan?: () => void;
    onEditSelectedPlan?: () => void;
    onOpenColumnSettings?: () => void;
    onToggleFilters: () => void;
    selectedPlansCount?: number;
};

export const PlansNavigationRail = React.memo((props: Props) => {

    const {
        filtersEnabled,
        layout,
        onAddPlan,
        onDeleteSelectedPlan,
        onEditSelectedPlan,
        onOpenColumnSettings,
        onToggleFilters,
        selectedPlansCount
    } = props;

    return (
        <NavigationRail border layout={layout}>
            <Tooltip key='filters' title='Toggle filters' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleFilters}
                        children={filtersEnabled ? <FilterAltIcon /> : <FilterAltOutlinedIcon />}
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
                            children={<ViewWeekOutlinedIcon />}
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
                            children={<PostAddOutlinedIcon />}
                            size='large'
                        />
                    </div>
                </Tooltip>
            }
            <Tooltip key='edit' title='Rename selected' placement='right'>
                <div>
                    <IconButton
                        onClick={onEditSelectedPlan}
                        children={<DriveFileRenameOutlineIcon />}
                        size='large'
                        disabled={!selectedPlansCount}
                    />
                </div>
            </Tooltip>
            <Tooltip key='delete' title='Delete selected' placement='right'>
                <div>
                    <IconButton
                        color='error'
                        onClick={onDeleteSelectedPlan}
                        children={<DeleteForeverOutlinedIcon />}
                        size='large'
                        disabled={!selectedPlansCount}
                    />
                </div>
            </Tooltip>
        </NavigationRail>
    );

});
