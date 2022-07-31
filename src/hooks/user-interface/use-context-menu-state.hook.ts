import { MouseEvent, useCallback, useState } from 'react';
import { Position2D } from '../../types/internal';

export type ContextMenuStateHookResult<T extends string> = {

    /**
     * The name or ID of the currently open context menu. Will be `undefined` to
     * indicate that there is no context menu open.
     */
    activeContextMenu: T | undefined;

    /**
     * The anchor coordinates for the context menus. By design, there can only be
     * one context menu open at a time. This position will be shared between all the
     * manged context menus.
     */
    contextMenuPosition: Position2D;

    /**
     * Close the currently open menu, if any;
     */
    closeContextMenu(): void;

    openContextMenu(menu: T, position: Position2D): void;
    openContextMenu(menu: T, e: MouseEvent): void;

};

/**
 * Utility hook for managing context menus. This intended to be used at the
 * route component level. Each instance hook will only allow at most one managed
 * context menu to be open at a time.
 */
export const useContextMenuState = function <T extends string = string>(): ContextMenuStateHookResult<T> {

    /**
     * The name or ID of the currently open context menu, if any.
     */
    const [activeContextMenu, setActiveContextMenu] = useState<T>();

    /**
     * The anchor coordinates for the context menus. By design, there can only be
     * one context menu open at a time. This position will be shared between all the
     * manged context menus.
     */
    const [contextMenuPosition, setContextMenuPosition] = useState<Position2D>([0, 0]);

    const closeContextMenu = useCallback((): void => {
        setActiveContextMenu(undefined);
    }, []);


    const openContextMenu = useCallback((menu: T, positionSource: MouseEvent | Position2D): void => {
        if (!Array.isArray(positionSource)) {
            const { pageX, pageY } = positionSource;
            positionSource = [pageX, pageY];
        }
        setContextMenuPosition(positionSource);
        setActiveContextMenu(menu);
    }, []);

    return {
        activeContextMenu,
        contextMenuPosition,
        closeContextMenu,
        openContextMenu
    };

};