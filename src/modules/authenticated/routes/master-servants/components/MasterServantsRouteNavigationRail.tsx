import { BarChart as BarChartIcon, Clear as ClearIcon, DeleteForeverOutlined as DeleteForeverOutlinedIcon, Done as DoneIcon, FilterAlt as FilterAltIcon, FilterAltOutlined as FilterAltOutlinedIcon, GroupAddOutlined, ImportExport as ImportExportIcon, ModeEditOutlined as ModeEditOutlinedIcon, PersonAddAlt1Outlined as PersonAddAlt1OutlinedIcon, PersonOff, Reorder as ReorderIcon, ViewWeekOutlined as ViewWeekOutlinedIcon } from '@mui/icons-material';
import { Divider, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { NavigationRail } from '../../../../../components/navigation/navigation-rail/navigation-rail.component';
import { PersonOffOutlined as PersonOffOutlinedIcon } from '@mui/icons-material';

type Props = {
    dragDropMode: boolean;
    filtersEnabled: boolean;
    layout: 'row' | 'column';
    onAddServant: () => void;
    onMultiAddServant: () => void;
    onDeleteSelectedServants: () => void;
    onDragDropActivate: () => void;
    onDragDropApply: () => void;
    onDragDropCancel: () => void;
    onEditSelectedServants: () => void;
    onOpenColumnSettings: () => void;
    onToggleFilters: () => void;
    onToggleShowUnsummonedServants: () => void;
    showUnsummonedServants: boolean;
    selectedServantsCount: number;
};

export const MasterServantsRouteNavigationRail = React.memo((props: Props) => {

    const {
        dragDropMode,
        filtersEnabled,
        layout,
        onAddServant,
        onMultiAddServant,
        onDeleteSelectedServants,
        onDragDropActivate,
        onDragDropApply,
        onDragDropCancel,
        onEditSelectedServants,
        onOpenColumnSettings,
        onToggleFilters,
        onToggleShowUnsummonedServants,
        showUnsummonedServants,
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
            {/* TODO Move this to display and/or filter settings. */}
            <Tooltip key='unsummoned' title='Toggle unsummoned servants' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleShowUnsummonedServants}
                        children={showUnsummonedServants ? <PersonOff /> : <PersonOffOutlinedIcon />}
                        size='large'
                        color={showUnsummonedServants ? 'primary' : undefined}
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
            <Tooltip key='add' title='Add servant' placement='right'>
                <div>
                    <IconButton
                        onClick={onAddServant}
                        children={<PersonAddAlt1OutlinedIcon />}
                        size='large'
                    />
                </div>
            </Tooltip>
            <Tooltip key='multi-add' title='Add multiple servants' placement='right'>
                <div>
                    <IconButton
                        onClick={onMultiAddServant}
                        children={<GroupAddOutlined />}
                        size='large'
                    />
                </div>
            </Tooltip>
            {/* TODO Hide based on mobile browser instead of by breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='reorder' title='Reorder servants' placement='right'>
                    <div>
                        <IconButton
                            onClick={onDragDropActivate}
                            children={<ReorderIcon />}
                            size='large'
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
            <Tooltip key='stats' title='Servant stats' placement='right'>
                <div>
                    <IconButton
                        component={Link}
                        to='stats'
                        children={<BarChartIcon />}
                        size='large'
                    />
                </div>
            </Tooltip>
            {/* TODO Hide based on mobile browser instead of by breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='import-export' title='Upload servant data' placement='right'>
                    {/* TODO This needs to open a menu with various import/export options. */}
                    <div>
                        <IconButton
                            component={Link}
                            to='../master/data/import/servants'
                            children={<ImportExportIcon />}
                            size='large'
                        />
                    </div>
                </Tooltip>
            }
        </NavigationRail>
    );

});
