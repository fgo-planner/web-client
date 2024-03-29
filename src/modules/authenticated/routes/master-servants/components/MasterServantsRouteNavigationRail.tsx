import { Divider, Icon, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { IconOutlined } from '../../../../../components/icons/IconOutlined';
import { NavigationRail } from '../../../../../components/navigation/navigation-rail/NavigationRail';

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
            <Tooltip key='filters' title='Toggle filters' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleFilters}
                        size='large'
                        color={filtersEnabled ? 'primary' : undefined}
                    >
                        {filtersEnabled ?
                            <Icon>filter_alt</Icon> :
                            <IconOutlined>filter_alt</IconOutlined>
                        }
                    </IconButton>
                </div>
            </Tooltip>
            {/* TODO Move this to display and/or filter settings. */}
            <Tooltip key='unsummoned' title='Toggle unsummoned servants' placement='right'>
                <div>
                    <IconButton
                        onClick={onToggleShowUnsummonedServants}
                        size='large'
                        color={showUnsummonedServants ? 'primary' : undefined}
                    >
                        {showUnsummonedServants ?
                            <Icon>person_off</Icon> :
                            <IconOutlined>person_off</IconOutlined>
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
            <Tooltip key='multi-add' title='Add multiple servants' placement='right'>
                <div>
                    <IconButton
                        onClick={onMultiAddServant}
                        size='large'
                    >
                        <IconOutlined>group_add</IconOutlined>
                    </IconButton>
                </div>
            </Tooltip>
            {/* TODO Hide based on mobile browser instead of by breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='reorder' title='Reorder servants' placement='right'>
                    <div>
                        <IconButton
                            onClick={onDragDropActivate}
                            size='large'
                        >
                            <IconOutlined>reorder</IconOutlined>
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
            <Tooltip key='stats' title='Servant stats' placement='right'>
                <div>
                    <IconButton
                        component={Link}
                        to='stats'
                        size='large'
                    >
                        <Icon>bar_chart</Icon>
                    </IconButton>
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
                            size='large'
                        >
                            <Icon>import_export</Icon>
                        </IconButton>
                    </div>
                </Tooltip>
            }
        </NavigationRail>
    );

});
