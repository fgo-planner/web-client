import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Popover, PopoverPosition } from '@mui/material';
import React, { useCallback } from 'react';
import { IconOutlined } from '../../../../../components/icons/IconOutlined';
import { useContextMenuProps } from '../../../../../hooks/user-interface/useContextMenuProps';

type Props = {
    open: boolean;
    position: PopoverPosition;
    selectedServantsCount: number;
    onAddServant(): void;
    onClose(): void;
    onDeleteSelectedServants(): void;
    onDeselectAllServants(): void;
    onEditSelectedServants(): void;
    onSelectAllServants(): void;
};

export const MasterServantsRouteServantRowContextMenu = React.memo((props: Props) => {

    const {
        onAddServant,
        onClose,
        onDeleteSelectedServants,
        onDeselectAllServants,
        onEditSelectedServants,
        onSelectAllServants,
        open,
        position,
        selectedServantsCount
    } = props;

    const { backdropProps } = useContextMenuProps(onClose);

    const handleAddServant = useCallback(() => {
        onClose();
        onAddServant();
    }, [onClose, onAddServant]);

    const handleEditSelectedServants = useCallback(() => {
        onClose();
        onEditSelectedServants();
    }, [onClose, onEditSelectedServants]);

    const handleDeleteSelectedServants = useCallback(() => {
        onClose();
        onDeleteSelectedServants();
    }, [onClose, onDeleteSelectedServants]);

    const handleSelectAllServants = useCallback(() => {
        onClose();
        onSelectAllServants();
    }, [onClose, onSelectAllServants]);

    const handleDeselectAllServants = useCallback(() => {
        onClose();
        onDeselectAllServants();
    }, [onClose, onDeselectAllServants]);

    return (
        <Popover
            open={open}
            anchorReference='anchorPosition'
            anchorPosition={position}
            BackdropProps={backdropProps}
            onClose={onClose}
        >
            <MenuList dense>
                <MenuItem
                    onClick={handleEditSelectedServants}
                    disabled={!selectedServantsCount}
                >
                    <ListItemIcon>
                        <IconOutlined>mode_edit</IconOutlined>
                    </ListItemIcon>
                    <ListItemText>Edit selected</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={handleDeleteSelectedServants}
                    disabled={!selectedServantsCount}
                >
                    <ListItemIcon>
                        <IconOutlined color='error'>delete_forever</IconOutlined>
                    </ListItemIcon>
                    <ListItemText>Delete selected</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleAddServant}>
                    <ListItemIcon>
                        <IconOutlined>person_add_alt_1</IconOutlined>
                    </ListItemIcon>
                    <ListItemText>Add servant</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleSelectAllServants}>
                    <ListItemText inset>Select All</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={handleDeselectAllServants}
                    disabled={!selectedServantsCount}
                >
                    <ListItemText inset>Deselect All</ListItemText>
                </MenuItem>
            </MenuList>
        </Popover>
    );

});
