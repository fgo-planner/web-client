import { useCallback } from 'react';
import { ContextMenuStateHookResult, useContextMenuState } from '../../../../../hooks/user-interface/useContextMenuState';
import { DefaultDialogInfo, useDialogState } from '../../../../../hooks/user-interface/useDialogState';
import { MasterServantEditDialogData } from '../../../components/master/servant/edit-dialog/MasterServantEditDialogData.type';
import { MasterServantsRouteDeleteDialogData } from '../components/MasterServantsRouteDeleteDialog';

export type MasterServantRouteContextMenu =
    'header' |
    'row';

export type MasterServantRouteDialog =
    'masterServantDelete' |
    'masterServantEdit' |
    'masterServantMultiAdd' | 
    'reloadOnStaleData' |
    'saveOnStaleData';

export type MasterServantRouteOpenDialogInfo = {
    name: 'masterServantMultiAdd' | 'reloadOnStaleData' | 'saveOnStaleData';
} | {
    name: 'masterServantDelete';
    data: MasterServantsRouteDeleteDialogData;  // TODO Create type for this
} | {
    name: 'masterServantEdit';
    data: MasterServantEditDialogData;
};

export type MasterServantsRouteModalStateHookResult = ContextMenuStateHookResult<MasterServantRouteContextMenu> & {
    activeDialogInfo: Readonly<DefaultDialogInfo | MasterServantRouteOpenDialogInfo>;
    closeActiveDialog(): void;
    openMasterServantDeleteDialog(data: MasterServantsRouteDeleteDialogData): void;
    openMasterServantEditDialog(data: MasterServantEditDialogData): void;
    openMasterServantMultiAddDialog(): void;
    openReloadOnStaleDataDialog(): void;
    openSaveOnStaleDataDialog(): void;
};

export function useMasterServantsRouteModalState(): MasterServantsRouteModalStateHookResult {

    const {
        activeDialogInfo,
        closeActiveDialog,
        openDialog
    } = useDialogState<MasterServantRouteDialog, MasterServantRouteOpenDialogInfo>();

    const {
        activeContextMenu,
        contextMenuPosition,
        closeActiveContextMenu,
        openContextMenu
    } = useContextMenuState<MasterServantRouteContextMenu>();

    const _openDialog = useCallback((data: DefaultDialogInfo | MasterServantRouteOpenDialogInfo): void => {
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

    return {
        activeContextMenu,
        activeDialogInfo,
        contextMenuPosition,
        closeActiveContextMenu,
        closeActiveDialog,
        openContextMenu,
        openMasterServantDeleteDialog,
        openMasterServantEditDialog,
        openMasterServantMultiAddDialog,
        openReloadOnStaleDataDialog,
        openSaveOnStaleDataDialog
    };

}
