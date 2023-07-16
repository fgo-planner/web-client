import { PopoverPosition } from '@mui/material';
import { MouseEvent, useCallback, useState } from 'react';

export type DefaultContextMenu = {
    name: undefined;
};

export type ActiveContextMenu<NAMES extends string> = {
    name: NAMES;
    data?: any;
};

export type ContextMenuStateHookResult<NAMES extends string, T extends ActiveContextMenu<NAMES>> = {

    activeContextMenu: Readonly<DefaultContextMenu | T>;

    /**
     * The anchor position for the context menus. By design, there can only be one
     * context menu open at a time. This position will be shared between all the
     * manged context menus.
     */
    contextMenuPosition: PopoverPosition;

    /**
     * Close the currently open menu, if any.
     */
    closeActiveContextMenu(): void;

    openContextMenu(data: DefaultContextMenu | T, event: MouseEvent): void;

};

// eslint-disable-next-line @typescript-eslint/no-redeclare
const DefaultContextMenu = {
    name: undefined
} as const;

/**
 * Utility hook for managing context menus in a route. This intended to be used
 * at the route component level. Each instance hook will only allow at most one
 * managed context menu to be open at a time.
 */
// eslint-disable-next-line max-len
export const useContextMenuState = function <NAMES extends string, T extends ActiveContextMenu<NAMES>>(): ContextMenuStateHookResult<NAMES, T> {

    const [activeContextMenu, setActiveContextMenu] = useState<Readonly<DefaultContextMenu | T>>(DefaultContextMenu);

    /**
     * The anchor position for the context menus. By design, there can only be one
     * context menu open at a time. This position will be shared between all the
     * manged context menus.
     */
    const [contextMenuPosition, setContextMenuPosition] = useState<PopoverPosition>({ top: 0, left: 0 });

    const closeActiveContextMenu = useCallback((): void => {
        setActiveContextMenu(prevOpenContextMenu => {
            if (prevOpenContextMenu.name === undefined) {
                return prevOpenContextMenu;
            }
            return DefaultContextMenu;
        });
    }, []);


    const openContextMenu = useCallback((menu: T, event: MouseEvent): void => {
        event.preventDefault();
        const {
            pageX: left,
            pageY: top
        } = event;
        setContextMenuPosition({ top, left });
        setActiveContextMenu(menu);
    }, []);

    return {
        activeContextMenu,
        contextMenuPosition,
        closeActiveContextMenu,
        openContextMenu
    };

};
