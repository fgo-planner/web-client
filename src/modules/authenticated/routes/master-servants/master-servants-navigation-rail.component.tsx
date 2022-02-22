import { AccessibilityNew as AccessibilityNewIcon, BarChart as BarChartIcon, Clear as ClearIcon, DeleteForeverOutlined as DeleteForeverOutlinedIcon, Done as DoneIcon, GroupAddOutlined, ImportExport as ImportExportIcon, ModeEditOutlined as ModeEditOutlinedIcon, PersonAddAlt1Outlined as PersonAddAlt1OutlinedIcon, Reorder as ReorderIcon } from '@mui/icons-material';
import { Divider, IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { NavigationRail } from '../../../../components/navigation/navigation-rail.component';

type Props = {
    dragDropMode: boolean;
    onAddServant: () => void;
    onDeleteSelectedServants: () => void;
    onDragDropActivate: () => void;
    onDragDropApply: () => void;
    onDragDropCancel: () => void;
    onEditSelectedServants: () => void;
    selectedServantsCount: number;
};

export const MasterServantsNavigationRail = React.memo((props: Props) => {

    const {
        dragDropMode,
        onAddServant,
        onDeleteSelectedServants,
        onDragDropActivate,
        onDragDropApply,
        onDragDropCancel,
        onEditSelectedServants,
        selectedServantsCount
    } = props;

    if (dragDropMode) {
        return (
            <NavigationRail>
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
        <NavigationRail>
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
                        children={<GroupAddOutlined />}
                        size='large'
                    />
                </div>
            </Tooltip>
            <Tooltip key='reorder' title='Reorder servants' placement='right'>
                <div>
                    <IconButton
                        onClick={onDragDropActivate}
                        children={<ReorderIcon />}
                        size='large'
                    />
                </div>
            </Tooltip>
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
            
            <Tooltip key='costumes' title='Costumes' placement='right'>
                <div>
                    <IconButton
                        component={Link}
                        to='costumes'
                        children={<AccessibilityNewIcon />}
                        size='large'
                    />
                </div>
            </Tooltip>
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
        </NavigationRail>
    );

});
