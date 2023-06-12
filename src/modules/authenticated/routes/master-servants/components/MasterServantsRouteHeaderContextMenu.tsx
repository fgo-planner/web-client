import { ListItemIcon, ListItemText, MenuItem, MenuList, Popover, PopoverPosition } from '@mui/material';
import React, { useCallback } from 'react';
import { IconOutlined } from '../../../../../components/icons/IconOutlined';
import { useContextMenuProps } from '../../../../../hooks/user-interface/useContextMenuProps';

type Props = {
    open: boolean;
    position: PopoverPosition;
    onClose(): void;
    onOpenColumnSettings(): void;
};

export const MasterServantsRouteHeaderContextMenu = React.memo((props: Props) => {

    const {
        open,
        position,
        onClose,
        onOpenColumnSettings
    } = props;

    const { backdropProps } = useContextMenuProps(onClose);

    const handleOpenColumnSettings = useCallback(() => {
        onClose();
        onOpenColumnSettings();
    }, [onClose, onOpenColumnSettings]);

    return (
        <Popover
            open={open}
            anchorReference='anchorPosition'
            anchorPosition={position}
            BackdropProps={backdropProps}
            onClose={onClose}
        >
            <MenuList dense>
                <MenuItem onClick={handleOpenColumnSettings}>
                    <ListItemIcon>
                        <IconOutlined>view_week</IconOutlined>
                    </ListItemIcon>
                    <ListItemText>Column settings</ListItemText>
                </MenuItem>
            </MenuList>
        </Popover>
    );

});
