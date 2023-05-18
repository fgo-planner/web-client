import { BackdropProps } from '@mui/material';
import { MouseEvent, useMemo } from 'react';

type ContextMenuPropsHookResult = {
    backdropProps: Partial<BackdropProps>;
};

/**
 * Provides common props for `Popover` and other components used for context
 * menus.
 */
export const useContextMenuProps = (onClose: () => void): ContextMenuPropsHookResult => {

    const backdropProps = useMemo(() => ({
        onContextMenu: (e: MouseEvent) => {
            e.preventDefault();
            onClose();
        },
        style: {
            opacity: 0
        }
    }), [onClose]);

    return {
        backdropProps
    };

};
