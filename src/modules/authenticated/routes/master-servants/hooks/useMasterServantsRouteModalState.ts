import { PopoverPosition } from '@mui/material';
import { MouseEvent, useCallback } from 'react';
import { DefaultContextMenu, useContextMenuState } from '../../../../../hooks/user-interface/useContextMenuState';
import { DefaultDialog, useDialogState } from '../../../../../hooks/user-interface/useDialogState';
import { MasterServantEditDialogData } from '../../../components/master/servant/edit-dialog/MasterServantEditDialogData.type';
import { MasterServantsRouteDeleteDialogData } from '../components/MasterServantsRouteDeleteDialog';

export type MasterServantRouteContextMenu =
    'header' |
    'row';

export type MasterServantRouteContextMenuData = {
    name: MasterServantRouteContextMenu;
};

export type MasterServantRouteDialog =
    'masterServantDelete' |
    'masterServantEdit' |
    'masterServantMultiAdd' |
    'reloadOnStaleData' |
    'saveOnStaleData';

export type MasterServantRouteDialogData = {
    name: 'masterServantMultiAdd' | 'reloadOnStaleData' | 'saveOnStaleData';
} | {
    name: 'masterServantDelete';
    data: MasterServantsRouteDeleteDialogData;
} | {
    name: 'masterServantEdit';
    data: MasterServantEditDialogData;
};

export type MasterServantsRouteModalStateHookResult = {
    activeContextMenu: Readonly<DefaultContextMenu | MasterServantRouteContextMenuData>;
    contextMenuPosition: PopoverPosition;
    closeActiveContextMenu(): void;
    openHeaderContextMenu(event: MouseEvent): void;
    openServantRowContextMenu(event: MouseEvent): void;
} & {
    activeDialog: Readonly<DefaultDialog | MasterServantRouteDialogData>;
    closeActiveDialog(): void;
    openMasterServantDeleteDialog(data: MasterServantsRouteDeleteDialogData): void;
    openMasterServantEditDialog(data: MasterServantEditDialogData): void;
    openMasterServantMultiAddDialog(): void;
    openReloadOnStaleDataDialog(): void;
    openSaveOnStaleDataDialog(): void;
};

export function useMasterServantsRouteModalState(): MasterServantsRouteModalStateHookResult {

    const {
        activeDialog,
        closeActiveDialog,
        openDialog
    } = useDialogState<MasterServantRouteDialog, MasterServantRouteDialogData>();

    const {
        activeContextMenu,
        contextMenuPosition,
        closeActiveContextMenu,
        openContextMenu
    } = useContextMenuState<MasterServantRouteContextMenu, MasterServantRouteContextMenuData>();


    //#region Dialogs

    const _openDialog = useCallback((data: DefaultDialog | MasterServantRouteDialogData): void => {
        closeActiveContextMenu();
        openDialog(data);
    }, [closeActiveContextMenu, openDialog]);

    const openMasterServantDeleteDialog = useCallback((data: MasterServantsRouteDeleteDialogData): void => {
        _openDialog({ name: 'masterServantDelete', data });
    }, [_openDialog]);

    const openMasterServantEditDialog = useCallback((data: MasterServantEditDialogData): void => {
        _openDialog({ name: 'masterServantEdit', data });
    }, [_openDialog]);

    const openMasterServantMultiAddDialog = useCallback((): void => {
        _openDialog({ name: 'masterServantMultiAdd' });
    }, [_openDialog]);

    const openReloadOnStaleDataDialog = useCallback((): void => {
        _openDialog({ name: 'reloadOnStaleData' });
    }, [_openDialog]);

    const openSaveOnStaleDataDialog = useCallback((): void => {
        _openDialog({ name: 'saveOnStaleData' });
    }, [_openDialog]);

    //#endregion


    //#region Context menus

    const openHeaderContextMenu = useCallback((event: MouseEvent): void => {
        openContextMenu({ name: 'header' }, event);
    }, [openContextMenu]);

    const openServantRowContextMenu = useCallback((event: MouseEvent): void => {
        openContextMenu({ name: 'row' }, event);
    }, [openContextMenu]);

    //#endregion


    return {
        activeContextMenu,
        activeDialog,
        contextMenuPosition,
        closeActiveContextMenu,
        closeActiveDialog,
        openHeaderContextMenu,
        openMasterServantDeleteDialog,
        openMasterServantEditDialog,
        openMasterServantMultiAddDialog,
        openReloadOnStaleDataDialog,
        openSaveOnStaleDataDialog,
        openServantRowContextMenu
    };

}
