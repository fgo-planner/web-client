import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Popover } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { IconOutlined } from '../../../../../components/icons';
import { Position2D } from '../../../../../types';
import { EventHandlers } from '../../../../../utils/event-handlers';

type Props = {
    onAddServant: () => void;
    onClose: () => void;
    onDeleteSelectedServants: () => void;
    onDeselectAllServants: () => void;
    onEditSelectedServants: () => void;
    onSelectAllServants: () => void;
    open: boolean;
    position: Position2D;
    selectedServantsCount: number;
};

/**
 * For some reason, setting the transition duration zero may result in the
 * popover being displayed in the top-left corder of the window (0, 0) for a
 * brief moment when it is opened. Setting the duration to 1 fixes this.
 */
const TransitionDuration = 1;

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
        selectedServantsCount,
    } = props;

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

    const anchorPosition = useMemo(() => {
        const [left, top] = position;
        return { top, left };
    }, [position]);

    const backdropProps = useMemo(() => ({
        onContextMenu: EventHandlers.preventDefault,
        style: { opacity: 0 }
    }), []);

    return (
        <Popover
            open={open}
            anchorReference='anchorPosition'
            anchorPosition={anchorPosition}
            BackdropProps={backdropProps}
            transitionDuration={TransitionDuration}
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
