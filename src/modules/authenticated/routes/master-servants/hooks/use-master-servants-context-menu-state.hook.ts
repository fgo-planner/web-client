import { MouseEvent, MouseEventHandler, useCallback } from 'react';
import { ContextMenuStateHookResult, useContextMenuState } from '../../../../../hooks/user-interface/use-context-menu-state.hook';

export type MasterServantsContextMenus =
    'header' |
    'row';

export type MasterServantsContextMenuStateHookResult = {
    openHeaderContextMenu: MouseEventHandler;
    openRowContextMenu: MouseEventHandler;
} & Omit<ContextMenuStateHookResult<MasterServantsContextMenus>, 'openContextMenu'>;

/**
 * Wrapper for the `useContextMenuState` hook that provides functions specific
 * to the master servants route.
 * 
 * This is intended to be used only within the `MasterServants` route component,
 * do not use inside any other component!
 */
export const useMasterServantsContextMenuState = (): MasterServantsContextMenuStateHookResult => {

    const {
        activeContextMenu,
        contextMenuPosition,
        closeContextMenu,
        openContextMenu
    } = useContextMenuState<MasterServantsContextMenus>();

    const openHeaderContextMenu = useCallback((e: MouseEvent): void => {
        openContextMenu('header', e);
    }, [openContextMenu]);

    const openRowContextMenu = useCallback((e: MouseEvent): void => {
        openContextMenu('row', e);
    }, [openContextMenu]);

    return {
        activeContextMenu,
        contextMenuPosition,
        closeContextMenu,
        openHeaderContextMenu,
        openRowContextMenu
    };

};
