import { PopoverPosition } from '@mui/material';
import { MouseEvent, useCallback } from 'react';
import { DefaultContextMenu, useContextMenuState } from '../../../../../hooks/user-interface/useContextMenuState';
import { DefaultDialog, useDialogState } from '../../../../../hooks/user-interface/useDialogState';
import { MasterServantEditDialogData } from '../../../components/master/servant/edit-dialog/MasterServantEditDialogData.type';
import { MasterServantsRouteColumnSettingsDialogData } from '../components/MasterServantsRouteColumnSettingsDialog';
import { MasterServantsRouteDeleteDialogData } from '../components/MasterServantsRouteDeleteDialog';

type MasterServantsRouteContextMenuName =
    'header' |
    'row';

type MasterServantsRouteContextMenu = {
    name: MasterServantsRouteContextMenuName;
};

type MasterServantsRouteDialogName =
    'columnSettings' |
    'masterServantDelete' |
    'masterServantEdit' |
    'masterServantMultiAdd' |
    'reloadOnStaleData' |
    'saveOnStaleData';

type MasterServantsRouteDialog = {
    name: 'masterServantMultiAdd' | 'reloadOnStaleData' | 'saveOnStaleData';
} | {
    name: 'columnSettings',
    data: MasterServantsRouteColumnSettingsDialogData;
} | {
    name: 'masterServantDelete';
    data: MasterServantsRouteDeleteDialogData;
} | {
    name: 'masterServantEdit';
    data: MasterServantEditDialogData;
};

export type MasterServantsRouteModalStateHookResult = {
    activeContextMenu: Readonly<DefaultContextMenu | MasterServantsRouteContextMenu>;
    contextMenuPosition: PopoverPosition;
    closeActiveContextMenu(): void;
    openHeaderContextMenu(event: MouseEvent): void;
    openServantRowContextMenu(event: MouseEvent): void;
} & {
    activeDialog: Readonly<DefaultDialog | MasterServantsRouteDialog>;
    closeActiveDialog(): void;
    openColumnSettingsDialog(data: MasterServantsRouteColumnSettingsDialogData): void;
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
    } = useDialogState<MasterServantsRouteDialogName, MasterServantsRouteDialog>();

    const {
        activeContextMenu,
        contextMenuPosition,
        closeActiveContextMenu,
        openContextMenu
    } = useContextMenuState<MasterServantsRouteContextMenuName, MasterServantsRouteContextMenu>();


    //#region Dialogs

    const _openDialog = useCallback((data: DefaultDialog | MasterServantsRouteDialog): void => {
        closeActiveContextMenu();
        openDialog(data);
    }, [closeActiveContextMenu, openDialog]);

    const openColumnSettingsDialog = useCallback((data: MasterServantsRouteColumnSettingsDialogData): void => {
        _openDialog({ name: 'columnSettings', data });
    }, [_openDialog]);

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
        openColumnSettingsDialog,
        openMasterServantDeleteDialog,
        openMasterServantEditDialog,
        openMasterServantMultiAddDialog,
        openReloadOnStaleDataDialog,
        openSaveOnStaleDataDialog,
        openServantRowContextMenu
    };

}
