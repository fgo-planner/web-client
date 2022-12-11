import { useCallback } from 'react';
import { ContextMenuStateHookResult, useContextMenuState } from '../../../../../hooks/user-interface/useContextMenuState';
import { DefaultDialogInfo, useDialogState } from '../../../../../hooks/user-interface/useDialogState';
import { MasterServantAggregatedData } from '../../../../../types';
import { MasterServantEditDialogData } from '../../../components/master/servant/edit-dialog/MasterServantEditDialogData.type';
import { PlanRouteMasterItemsEditDialogData } from '../components/PlanRouteMasterItemsEditDialogData.type';
import { PlanRoutePlanServantDeleteDialogData } from '../components/PlanRoutePlanServantDeleteDialog';
import { PlanRoutePlanServantEditDialogData } from '../components/PlanRoutePlanServantEditDialogData.type';

export type PlanRouteContextMenu = string;

export type PlanRouteDialog =
    'masterItemsEdit' |
    'masterServantEdit' |
    'planServantDelete' |
    'planServantEdit' |
    'planServantMultiAdd' | 
    'reloadOnStaleData' |
    'saveOnStaleData';

export type PlanRouteOpenDialogInfo = {
    name: 'reloadOnStaleData' | 'saveOnStaleData';
} | {
    name: 'masterItemsEdit';
    data: PlanRouteMasterItemsEditDialogData;
} | {
    name: 'masterServantEdit';
    data: MasterServantEditDialogData;
} | {
    name: 'planServantDelete';
    data: PlanRoutePlanServantDeleteDialogData;  // TODO Create wrapper type for this
} | {
    name: 'planServantEdit';
    data: PlanRoutePlanServantEditDialogData;  // TODO Create wrapper type for this
} | {
    name: 'planServantMultiAdd';
    data: ReadonlyArray<MasterServantAggregatedData>;
};

export type PlanRouteModalStateHookResult = ContextMenuStateHookResult<PlanRouteContextMenu> & {
    activeDialogInfo: Readonly<DefaultDialogInfo | PlanRouteOpenDialogInfo>;
    closeActiveDialog(): void;
    openMasterItemsEditDialog(data: PlanRouteMasterItemsEditDialogData): void;
    openMasterServantEditDialog(data: MasterServantEditDialogData): void;
    openPlanServantDeleteDialog(data: PlanRoutePlanServantDeleteDialogData): void;
    openPlanServantEditDialog(data: PlanRoutePlanServantEditDialogData): void;
    openPlanServantMultiAddDialog(data: ReadonlyArray<MasterServantAggregatedData>): void;
    openReloadOnStaleDataDialog(): void;
    openSaveOnStaleDataDialog(): void;
};

export function usePlanRouteModalState(): PlanRouteModalStateHookResult {

    const {
        activeDialogInfo,
        closeActiveDialog,
        openDialog
    } = useDialogState<PlanRouteDialog, PlanRouteOpenDialogInfo>();

    const {
        activeContextMenu,
        contextMenuPosition,
        closeActiveContextMenu,
        openContextMenu
    } = useContextMenuState<PlanRouteContextMenu>();

    const _openDialog = useCallback((data: DefaultDialogInfo | PlanRouteOpenDialogInfo): void => {
        closeActiveContextMenu();
        openDialog(data);
    }, [closeActiveContextMenu, openDialog]);

    const openMasterItemsEditDialog = useCallback((data: PlanRouteMasterItemsEditDialogData): void => {
        _openDialog({ name: 'masterItemsEdit', data });
    }, [_openDialog]);

    const openMasterServantEditDialog = useCallback((data: MasterServantEditDialogData): void => {
        _openDialog({ name: 'masterServantEdit', data });
    }, [_openDialog]);

    const openPlanServantDeleteDialog = useCallback((data: PlanRoutePlanServantDeleteDialogData): void => {
        _openDialog({ name: 'planServantDelete', data });
    }, [_openDialog]);

    const openPlanServantEditDialog = useCallback((data: PlanRoutePlanServantEditDialogData): void => {
        _openDialog({ name: 'planServantEdit', data });
    }, [_openDialog]);

    const openPlanServantMultiAddDialog = useCallback((data: ReadonlyArray<MasterServantAggregatedData>): void => {
        _openDialog({ name: 'planServantMultiAdd', data });
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
        openMasterItemsEditDialog,
        openMasterServantEditDialog,
        openPlanServantDeleteDialog,
        openPlanServantEditDialog,
        openPlanServantMultiAddDialog,
        openReloadOnStaleDataDialog,
        openSaveOnStaleDataDialog
    };

}
