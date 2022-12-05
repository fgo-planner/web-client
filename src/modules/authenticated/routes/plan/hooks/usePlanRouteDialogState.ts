import { useCallback, useState } from 'react';
import { MasterServantAggregatedData } from '../../../../../types';
import { PlanRoutePlanServantDeleteDialogData } from '../components/PlanRoutePlanServantDeleteDialog';
import { PlanRoutePlanServantEditDialogData } from '../components/PlanRoutePlanServantEditDialogData.type';

export type PlanRouteDialogs =
    'masterItemsEdit' |
    'masterServantEdit' |
    'planServantDelete' |
    'planServantEdit' |
    'planServantMultiAdd';

export type PlanRouteOpenDialogInfo = {
    name: undefined;
} | {
    name: 'masterItemsEdit';
    data: any;  // TODO Create type for this
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
    openMasterItemsEditDialog: (data: any) => void;
    openMasterServantEditDialog: (data: any) => void;
    openPlanServantDeleteDialog: (data: PlanRoutePlanServantDeleteDialogData) => void;
    openPlanServantEditDialog: (data: PlanRoutePlanServantEditDialogData) => void;
    openPlanServantMultiAddDialog: (data: ReadonlyArray<MasterServantAggregatedData>) => void;
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

    const openMasterItemsEditDialog = useCallback((data: any): void => {
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

    return {
        openDialogInfo,
        closeAllDialogs,
        openMasterItemsEditDialog,
        openMasterServantEditDialog,
        openPlanServantDeleteDialog,
        openPlanServantEditDialog,
        openPlanServantMultiAddDialog
    };

}
