import { DeleteForeverOutlined as DeleteForeverOutlinedIcon, ModeEditOutlined as ModeEditOutlinedIcon, GroupAddOutlined as GroupAddOutlinedIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';
import { NavigationRail } from '../../../../../components/navigation/navigation-rail/navigation-rail.component';

type Props = {
    hasSelection: boolean;
    layout: 'row' | 'column';
    onAddMasterAccount: () => void;
    onDeleteSelectedMasterAccount: () => void;
    onEditSelectedMasterAccount?: () => void;
};

export const MasterAccountsNavigationRail = React.memo((props: Props) => {

    const {
        hasSelection,
        layout,
        onAddMasterAccount,
        onDeleteSelectedMasterAccount,
        onEditSelectedMasterAccount
    } = props;

    return (
        <NavigationRail border layout={layout}>
            {/* This one is fine to hide based on breakpoint/layout. */}
            {layout !== 'row' &&
                <Tooltip key='add' title='Add account' placement='right'>
                    <div>
                        <IconButton
                            onClick={onAddMasterAccount}
                            children={<GroupAddOutlinedIcon />}
                            size='large'
                        />
                    </div>
                </Tooltip>
            }
            <Tooltip key='edit' title='Edit selected' placement='right'>
                <div>
                    <IconButton
                        onClick={onEditSelectedMasterAccount}
                        children={<ModeEditOutlinedIcon />}
                        size='large'
                        disabled={!hasSelection}
                    />
                </div>
            </Tooltip>
            <Tooltip key='delete' title='Delete selected' placement='right'>
                <div>
                    <IconButton
                        color='error'
                        onClick={onDeleteSelectedMasterAccount}
                        children={<DeleteForeverOutlinedIcon />}
                        size='large'
                        disabled={!hasSelection}
                    />
                </div>
            </Tooltip>
        </NavigationRail>
    );

});
