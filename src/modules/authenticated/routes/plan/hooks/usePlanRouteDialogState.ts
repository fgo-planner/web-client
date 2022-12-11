import { useCallback, useState } from 'react';
import { MasterServantAggregatedData } from '../../../../../types';
import { PlanRouteMasterItemsEditDialogData } from '../components/PlanRouteMasterItemsEditDialogData.type';
import { PlanRoutePlanServantDeleteDialogData } from '../components/PlanRoutePlanServantDeleteDialog';
import { PlanRoutePlanServantEditDialogData } from '../components/PlanRoutePlanServantEditDialogData.type';

export type PlanRouteDialogs =
    'masterItemsEdit' |
    'masterServantEdit' |
    'planServantDelete' |
    'planServantEdit' |
    'planServantMultiAdd' | 
    'reloadOnStaleData' |
    'saveOnStaleData';

export type PlanRouteOpenDialogInfo = {
    name: 'reloadOnStaleData' | 'saveOnStaleData' | undefined;
} | {
    name: 'masterItemsEdit';
    data: PlanRouteMasterItemsEditDialogData;
} | {
    name: 'masterServantEdit';
    data: any;  // TODO Create type for this
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

export type PlanRouteDialogState = {
    openDialogInfo: Readonly<PlanRouteOpenDialogInfo>;
    closeAllDialogs: () => void;
    openMasterItemsEditDialog: (data: PlanRouteMasterItemsEditDialogData) => void;
    openMasterServantEditDialog: (data: any) => void;
    openPlanServantDeleteDialog: (data: PlanRoutePlanServantDeleteDialogData) => void;
    openPlanServantEditDialog: (data: PlanRoutePlanServantEditDialogData) => void;
    openPlanServantMultiAddDialog: (data: ReadonlyArray<MasterServantAggregatedData>) => void;
    openReloadOnStaleDataDialog: () => void;
    openSaveOnStaleDataDialog: () => void;
};

const DefaultOpenDialogInfo = {
    name: undefined
};

export function usePlanRouteDialogState(): PlanRouteDialogState {

    const [openDialogInfo, setOpenDialogInfo] = useState<PlanRouteOpenDialogInfo>(DefaultOpenDialogInfo);
    
    const closeAllDialogs = useCallback((): void => {
        setOpenDialogInfo(prevOpenDialogInfo => {
            if (prevOpenDialogInfo.name === undefined) {
                return prevOpenDialogInfo;
            }
            return { name: undefined };
        });
    }, []);

    const openMasterItemsEditDialog = useCallback((data: PlanRouteMasterItemsEditDialogData): void => {
        setOpenDialogInfo({ name: 'masterItemsEdit', data });
    }, []);

    const openMasterServantEditDialog = useCallback((data: any): void => {
        setOpenDialogInfo({ name: 'masterServantEdit', data });
    }, []);

    const openPlanServantDeleteDialog = useCallback((data: PlanRoutePlanServantDeleteDialogData): void => {
        setOpenDialogInfo({ name: 'planServantDelete', data });
    }, []);

    const openPlanServantEditDialog = useCallback((data: PlanRoutePlanServantEditDialogData): void => {
        setOpenDialogInfo({ name: 'planServantEdit', data });
    }, []);

    const openPlanServantMultiAddDialog = useCallback((data: ReadonlyArray<MasterServantAggregatedData>): void => {
        setOpenDialogInfo({ name: 'planServantMultiAdd', data });
    }, []);

    const openReloadOnStaleDataDialog = useCallback((): void => {
        setOpenDialogInfo({ name: 'reloadOnStaleData' });
    }, []);

    const openSaveOnStaleDataDialog = useCallback((): void => {
        setOpenDialogInfo({ name: 'saveOnStaleData' });
    }, []);


    return {
        openDialogInfo,
        closeAllDialogs,
        openMasterItemsEditDialog,
        openMasterServantEditDialog,
        openPlanServantDeleteDialog,
        openPlanServantEditDialog,
        openPlanServantMultiAddDialog,
        openReloadOnStaleDataDialog,
        openSaveOnStaleDataDialog
    };

}
