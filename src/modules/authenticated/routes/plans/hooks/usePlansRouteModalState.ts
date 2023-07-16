import { PopoverPosition } from '@mui/material';
import { MouseEvent, useCallback } from 'react';
import { DefaultContextMenu, useContextMenuState } from '../../../../../hooks/user-interface/useContextMenuState';
import { DefaultDialog, useDialogState } from '../../../../../hooks/user-interface/useDialogState';
import { PlansRoutePlanEditDialogData } from '../components/PlansRoutePlanEditDialog';
import { PlansRoutePlanGroupEditDialogData } from '../components/PlansRoutePlanGroupEditDialog';

export type PlansRouteContextMenu =
    'header' |
    'planGroupRow' |
    'planRow';

export type PlansRouteContextMenuData = {
    name: PlansRouteContextMenu;
};

export type PlansRouteDialog =
    'planDelete' |
    'planEdit' |
    'planGroupEdit';

export type PlansRouteDialogData = {
    name: 'planDelete';
} | {
    name: 'planEdit',
    data: PlansRoutePlanEditDialogData;
} | {
    name: 'planGroupEdit',
    data: PlansRoutePlanGroupEditDialogData;
};

export type PlansRouteModalStateHookResult = {
    activeContextMenu: Readonly<DefaultContextMenu | PlansRouteContextMenuData>;
    contextMenuPosition: PopoverPosition;
    closeActiveContextMenu(): void;
    openHeaderContextMenu(event: MouseEvent): void;
    openPlanGroupRowContextMenu(event: MouseEvent): void;
    openPlanRowContextMenu(event: MouseEvent): void;
} & {
    activeDialog: Readonly<DefaultDialog | PlansRouteDialogData>;
    closeActiveDialog(): void;
    openPlanEditDialog(data: PlansRoutePlanEditDialogData): void;
    openPlanGroupEditDialog(data: PlansRoutePlanGroupEditDialogData): void;
    openPlanDeleteDialog(): void;
};

export function usePlansRouteModalState(): PlansRouteModalStateHookResult {

    const {
        activeDialog,
        closeActiveDialog,
        openDialog
    } = useDialogState<PlansRouteDialog, PlansRouteDialogData>();

    const {
        activeContextMenu,
        contextMenuPosition,
        closeActiveContextMenu,
        openContextMenu
    } = useContextMenuState<PlansRouteContextMenu, PlansRouteContextMenuData>();


    //#region Dialogs

    const _openDialog = useCallback((data: DefaultDialog | PlansRouteDialogData): void => {
        closeActiveContextMenu();
        openDialog(data);
    }, [closeActiveContextMenu, openDialog]);

    const openPlanEditDialog = useCallback((data: PlansRoutePlanEditDialogData): void => {
        _openDialog({ name: 'planEdit', data });
    }, [_openDialog]);

    const openPlanGroupEditDialog = useCallback((data: PlansRoutePlanGroupEditDialogData): void => {
        _openDialog({ name: 'planGroupEdit', data });
    }, [_openDialog]);


    const openPlanDeleteDialog = useCallback((): void => {
        _openDialog({ name: 'planDelete' });
    }, [_openDialog]);

    //#endregion


    //#region Context menus

    const openHeaderContextMenu = useCallback((event: MouseEvent): void => {
        openContextMenu({ name: 'header' }, event);
    }, [openContextMenu]);

    const openPlanRowContextMenu = useCallback((event: MouseEvent): void => {
        openContextMenu({ name: 'planRow' }, event);
    }, [openContextMenu]);

    const openPlanGroupRowContextMenu = useCallback((event: MouseEvent): void => {
        openContextMenu({ name: 'planGroupRow' }, event);
    }, [openContextMenu]);

    //#endregion


    return {
        activeContextMenu,
        activeDialog,
        contextMenuPosition,
        closeActiveContextMenu,
        closeActiveDialog,
        openHeaderContextMenu,
        openPlanDeleteDialog,
        openPlanEditDialog,
        openPlanGroupEditDialog,
        openPlanGroupRowContextMenu,
        openPlanRowContextMenu
    };

}
