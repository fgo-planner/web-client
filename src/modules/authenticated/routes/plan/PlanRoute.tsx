import { CollectionUtils, Functions, Immutable } from '@fgo-planner/common-core';
import { GameItemConstants, InstantiatedServantUpdateIndeterminateValue as IndeterminateValue, InstantiatedServantUtils, MasterServantAggregatedData, PlanServantAggregatedData, PlanServantUpdate, PlanServantUpdateUtils } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useEffect } from 'react';
import { PathPattern } from 'react-router';
import { useMatch, useNavigate } from 'react-router-dom';
import { PlanRequirementsTable } from '../../../../components/plan/requirements/table/PlanRequirementsTable';
import { useGameServantMap } from '../../../../hooks/data/useGameServantMap';
import { useSelectedInstancesHelper } from '../../../../hooks/user-interface/list-select-helper/useSelectedInstancesHelper';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/useActiveBreakpoints';
import { useDragDropHelper } from '../../../../hooks/user-interface/useDragDropHelper';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { EditDialogAction, ModalOnCloseReason } from '../../../../types';
import { SubscribablesContainer } from '../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../utils/subscription/SubscriptionTopics';
import { RouteDataEditControls } from '../../components/control/RouteDataEditControls';
import { RouteDataEditReloadOnStaleDataDialog } from '../../components/control/RouteDataEditReloadOnStaleDataDialog';
import { RouteDataEditSaveOnStaleDataDialog } from '../../components/control/RouteDataEditSaveOnStaleDataDialog';
import { usePlanDataEdit } from '../../hooks/usePlanDataEdit';
import { PlanRouteMasterItemsEditDialog } from './components/PlanRouteMasterItemsEditDialog';
import { PlanRouteMasterItemsEditDialogData } from './components/PlanRouteMasterItemsEditDialogData.type';
import { PlanRouteNavigationRail } from './components/PlanRouteNavigationRail';
import { PlanRoutePlanServantDeleteDialog, PlanRoutePlanServantDeleteDialogData } from './components/PlanRoutePlanServantDeleteDialog';
import { PlanRoutePlanServantEditDialog } from './components/PlanRoutePlanServantEditDialog';
import { PlanRoutePlanServantEditDialogData } from './components/PlanRoutePlanServantEditDialogData.type';
import { usePlanRouteModalState } from './hooks/usePlanRouteModalState';
import { usePlanRouteUserPreferences } from './hooks/usePlanRouteUserPreferences';

const PathMatchPattern: PathPattern = {
    path: '/user/master/planner/:id'
};

const computeAvailableServants = (
    planServantData: ReadonlyArray<PlanServantAggregatedData>,
    masterServantData: ReadonlyArray<MasterServantAggregatedData>
): ReadonlyArray<MasterServantAggregatedData> => {
    const planServantIds = planServantData.map(InstantiatedServantUtils.getInstanceId);
    const planServantIdSet = new Set(planServantIds);
    return masterServantData.filter(servantData => !planServantIdSet.has(servantData.instanceId));
};

const StyleClassPrefix = 'PlanRoute';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        spacing
    } = theme as Theme;

    return {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        [`& .${StyleClassPrefix}-upper-layout-container`]: {

        },
        [`& .${StyleClassPrefix}-lower-layout-container`]: {
            display: 'flex',
            height: '100%',
            overflow: 'hidden',
            [`& .${StyleClassPrefix}-main-content`]: {
                display: 'flex',
                width: `calc(100% - ${spacing(ThemeConstants.NavigationRailSizeScale)})`,
                [`& .${StyleClassPrefix}-table-container`]: {
                    flex: 1,
                    overflow: 'hidden'
                },
                [`& .${StyleClassPrefix}-info-panel-container`]: {
                    width: 320,
                    height: 'calc(100% - 84px)',
                    pr: 4,
                    py: 4,
                    boxSizing: 'border-box',
                    [breakpoints.down('xl')]: {
                        width: 300
                    }
                }
            },
            [breakpoints.down('sm')]: {
                flexDirection: 'column',
                [`& .${StyleClassPrefix}-main-content`]: {
                    width: '100%',
                    height: `calc(100% - ${spacing(ThemeConstants.NavigationRailSizeScale)})`
                }
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const PlanRoute = React.memo(() => {

    const routeMatch = useMatch<'id', string>(PathMatchPattern);
    const planId = routeMatch?.params.id;

    // console.debug('PlanRoute rendered', planId);

    const navigate = useNavigate();

    const gameServantMap = useGameServantMap();

    const {
        masterAccountId,
        masterAccountEditData,
        planEditData,
        planRequirements,
        updateMasterItems,
        updateMasterServants,
        updatePlanInfo,
        addPlanServant,
        addPlanServants,
        updatePlanServants,
        updatePlanServantOrder,
        deletePlanServants,
        fulfillPlanServants,
        addUpcomingResources,
        updateUpcomingResources,
        deleteUpcomingResources,
        awaitingRequest,
        isMasterAccountDataDirty,
        isMasterAccountDataStale,
        isPlanDataDirty,
        isPlanDataStale,
        reloadData,
        revertChanges,
        persistChanges
    } = usePlanDataEdit(planId);

    const {
        userPreferences: {
            planServantEditDialogActiveTab,
            table: tableOptions
        },
        setPlanServantEditDialogActiveTab,
        toggleCellSize,
        toggleRowHeaderMode,
        toggleShowEmptyColumns
    } = usePlanRouteUserPreferences();

    const {
        activeDialogInfo,
        closeActiveDialog,
        openMasterItemsEditDialog,
        openMasterServantEditDialog,
        openPlanServantDeleteDialog,
        openPlanServantEditDialog,
        openPlanServantMultiAddDialog,
        openReloadOnStaleDataDialog,
        openSaveOnStaleDataDialog
    } = usePlanRouteModalState();

    const {
        selectedData: selectedServantsData,
        selectAll: selectAllServants,
        deselectAll: deselectAllServants,
        updateSelection: updateServantSelection
    } = useSelectedInstancesHelper(
        planEditData.servantsData, 
        InstantiatedServantUtils.getInstanceId
    );

    const {
        dragDropData,
        startDragDrop,
        endDragDrop,
        handleDragOrderChange
    } = useDragDropHelper<Immutable<PlanServantAggregatedData>>(InstantiatedServantUtils.getInstanceId);

    /**
     * Whether drag-drop mode is active. Drag-drop mode is intended for the user to
     * rearrange the default ordering of the list. As such, when in drag-drop mode,
     * the full list in the current default order is visible, regardless of any
     * filter or visibility settings.
     */
    const dragDropMode = !!dragDropData;

    const { sm } = useActiveBreakpoints();

    //#region Topic subscriptions

    /**
     * Master account change subscription. Will redirect the user to the plans list
     * if another master account is selected.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(masterAccount => {
                if (!masterAccountId || masterAccountId === masterAccount?._id) {
                    return;
                }
                navigate('/user/master/planner');
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [masterAccountId, navigate]);

    //#endregion


    //#region Internal helper functions
    
    /**
     * Applies the update to the currently selected servants.
     */
    const applyUpdateToSelectedServants = useCallback((update: PlanServantUpdate) => {
        updatePlanServants(selectedServantsData.ids, update);
    }, [selectedServantsData, updatePlanServants]);

    /**
     * Deletes the currently selected servants.
     */
    // const deleteSelectedServants = useCallback((): void => {
    //     deletePlanServants(selectedServantsData.ids);
    // }, [deletePlanServants, selectedServantsData]);

    const openAddServantDialog = useCallback((): void => {
        const availableServants = computeAvailableServants(planEditData.servantsData, masterAccountEditData.servantsData);
        const planServantEditDialogData: PlanRoutePlanServantEditDialogData = {
            action: EditDialogAction.Add,
            data: {
                instanceId: IndeterminateValue,
                update: PlanServantUpdateUtils.createNew(planEditData.costumes),
                availableServants,
                unlockedCostumes: masterAccountEditData.costumes
            }
        };
        openPlanServantEditDialog(planServantEditDialogData);
    }, [masterAccountEditData, openPlanServantEditDialog, planEditData]);

    const openMultiAddServantDialog = useCallback((): void => {
        const availableServants = computeAvailableServants(planEditData.servantsData, masterAccountEditData.servantsData);
        openPlanServantMultiAddDialog(availableServants);
    }, [masterAccountEditData, openPlanServantMultiAddDialog, planEditData]);

    const openEditServantDialog = useCallback((): void => {
        if (!selectedServantsData.instances.length) {
            return;
        }
        const selectedServants = selectedServantsData.instances.map(servantData => servantData.planServant);
        const planServantEditDialogData: PlanRoutePlanServantEditDialogData = {
            action: EditDialogAction.Edit,
            data: {
                instanceId: IndeterminateValue,
                update: PlanServantUpdateUtils.createFromExisting(selectedServants, planEditData.costumes),
                availableServants: CollectionUtils.emptyArray(),
                unlockedCostumes: masterAccountEditData.costumes
            }
        };
        openPlanServantEditDialog(planServantEditDialogData);
    }, [masterAccountEditData, openPlanServantEditDialog, planEditData.costumes, selectedServantsData.instances]);

    const openDeleteServantDialog = useCallback((): void => {
        if (!selectedServantsData.instances.length) {
            return;
        }
        openPlanServantDeleteDialog({
            targetPlanServantsData: selectedServantsData.instances
        });
    }, [openPlanServantDeleteDialog, selectedServantsData]);

    const openEditItemsDialog = useCallback((): void => {
        const masterItemsEditDialogData: PlanRouteMasterItemsEditDialogData = {
            items: {
                ...masterAccountEditData.items
            },
            qp: masterAccountEditData.qp
        };
        openMasterItemsEditDialog(masterItemsEditDialogData);
    }, [masterAccountEditData, openMasterItemsEditDialog]);

    /**
     * Adds a listener to invoke the `openDeleteServantDialog` function when the
     * delete key is pressed.
     */
    useEffect(() => {
        const listener = (event: KeyboardEvent): void => {
            if (event.key !== 'Delete') {
                return;
            }
            openDeleteServantDialog();
        };
        window.addEventListener('keydown', listener);

        return () => window.removeEventListener('keydown', listener);
    }, [openDeleteServantDialog]);

    //#endregion


    //#region Navigation rail event handlers

    const handleMultiAddServant = openMultiAddServantDialog;

    const handleDragDropActivate = useCallback(() => {
        /**
         * Deselect servants...servant selection is not allowed in drag-drop mode.
         */
        deselectAllServants();
        startDragDrop(planEditData.servantsData);
    }, [deselectAllServants, planEditData, startDragDrop]);

    const handleDragDropApply = useCallback(() => {
        const updatedInstanceIdOrder = endDragDrop();
        if (!updatedInstanceIdOrder) {
            return;
        }
        updatePlanServantOrder(updatedInstanceIdOrder);
    }, [endDragDrop, updatePlanServantOrder]);

    const handleDragDropCancel = useCallback(() => {
        endDragDrop();
    }, [endDragDrop]);

    //#endregion


    //#region Table event handlers

    // const handleRowClick = useCallback((e: MouseEvent): void => {
    //     if (e.type === 'contextmenu') {
    //         openContextMenu('row', e);
    //     }
    // }, [openContextMenu]);

    const handleRowDoubleClick = useCallback(() => {
        openEditServantDialog();
    }, [openEditServantDialog]);

    // const handleSortChange = useCallback((column?: MasterServantListColumn, direction: SortDirection = 'asc'): void => {
    //     /**
    //      * Deselect servants when changing sort. This is consistent with Google Drive
    //      * behavior.
    //      */
    //     deselectAllServants();
    //     setSortOptions({
    //         sort: column,
    //         direction
    //     });
    // }, [deselectAllServants]);

    const handleMarkSelectedAsComplete = useCallback((): void => {
        if (!selectedServantsData.instances.length) {
            return;
        }
        fulfillPlanServants(selectedServantsData.ids, false);
    }, [fulfillPlanServants, selectedServantsData]);

    //#endregion


    //#region Other event handlers

    const isDataStale = isMasterAccountDataStale || isPlanDataStale;

    const saveData = useCallback(async (): Promise<void> => {
        try {
            persistChanges();
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
        }
    }, [persistChanges]);

    const handleSaveButtonClick = useCallback((_event: MouseEvent): void => {
        if (isDataStale) {
            openSaveOnStaleDataDialog();
        } else {
            saveData();
        }
    }, [isDataStale, openSaveOnStaleDataDialog, saveData]);

    const handleReloadButtonClick = useCallback((_event: MouseEvent): void => {
        openReloadOnStaleDataDialog();
    }, [openReloadOnStaleDataDialog]);

    const handleRevertButtonClick = useCallback((_event: MouseEvent): void => {
        revertChanges();
    }, [revertChanges]);

    const handleReloadDataDialogClose = useCallback((_event: MouseEvent, reason: ModalOnCloseReason): void => {
        if (reason === 'submit') {
            reloadData();
        }
        closeActiveDialog();
    }, [closeActiveDialog, reloadData]);

    const handleSaveDataDialogClose = useCallback((_event: MouseEvent, reason: ModalOnCloseReason): void => {
        if (reason === 'submit') {
            saveData();
        }
        closeActiveDialog();
    }, [closeActiveDialog, saveData]);

    const handleEditServantDialogClose = useCallback((
        _event: MouseEvent,
        _reason: ModalOnCloseReason,
        data?: PlanRoutePlanServantEditDialogData
    ): void => {
        closeActiveDialog();
        /**
         * Close the dialog without taking any further action if the changes were
         * cancelled (if `data` is undefined, then the changes were cancelled).
         */
        if (!data) {
            return;
        }
        if (data.action === EditDialogAction.Add) {
            const { instanceId, update } = data.data;
            addPlanServant(instanceId, update);
        } else {
            applyUpdateToSelectedServants(data.data.update);
        }
    }, [addPlanServant, applyUpdateToSelectedServants, closeActiveDialog]);

    const handleDeleteServantDialogClose = useCallback((
        _event: MouseEvent,
        _reason: ModalOnCloseReason,
        data?: PlanRoutePlanServantDeleteDialogData
    ): any => {
        closeActiveDialog();
        /**
         * Close the dialog without taking any further action if the changes were
         * cancelled (if `data` is undefined, then the changes were cancelled).
         */
        if (!data) {
            return;
        }
        deletePlanServants(data.targetPlanServantsData.map(InstantiatedServantUtils.getInstanceId));
    }, [closeActiveDialog, deletePlanServants]);

    const handleEditItemsDialogClose = useCallback((
        _event: MouseEvent,
        _reason: ModalOnCloseReason,
        data?: PlanRouteMasterItemsEditDialogData
    ): any => {
        closeActiveDialog();
        /**
         * Close the dialog without taking any further action if the changes were
         * cancelled (if `data` is undefined, then the changes were cancelled).
         */
        if (!data) {
            return;
        }
        const itemUpdates = {
            ...data.items,
            [GameItemConstants.QpItemId]: data.qp
        };
        updateMasterItems(itemUpdates);
    }, [closeActiveDialog, updateMasterItems]);

    //#endregion


    //#region Component rendering

    /**
     * These can be undefined during the initial render.
     */
    if (!gameServantMap || !masterAccountId || !planRequirements) {
        return null;
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-upper-layout-container`}>
                <RouteDataEditControls
                    disabled={awaitingRequest}
                    isDataDirty={isMasterAccountDataDirty || isPlanDataDirty}
                    isDataStale={isDataStale}
                    title={planEditData.name}
                    onReloadButtonClick={handleReloadButtonClick}
                    onRevertButtonClick={handleRevertButtonClick}
                    onSaveButtonClick={handleSaveButtonClick}
                />
            </div>
            <div className={`${StyleClassPrefix}-lower-layout-container`}>
                <PlanRouteNavigationRail
                    layout={sm ? 'column' : 'row'}
                    dragDropMode={dragDropMode}
                    selectedServantsCount={selectedServantsData.ids.size}
                    onAddServant={openAddServantDialog}
                    onMultiAddServant={handleMultiAddServant}
                    onDeleteSelectedServants={openDeleteServantDialog}
                    onDragDropActivate={handleDragDropActivate}
                    onDragDropApply={handleDragDropApply}
                    onDragDropCancel={handleDragDropCancel}
                    onEditSelectedServants={openEditServantDialog}
                    onMarkSelectedAsComplete={handleMarkSelectedAsComplete}
                    onOpenDisplaySettings={Functions.nullSupplier}
                    onToggleCellSize={toggleCellSize}
                    onToggleRowheaderMode={toggleRowHeaderMode}
                    onToggleShowUnused={toggleShowEmptyColumns}
                />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <div className={clsx(`${StyleClassPrefix}-table-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                        <PlanRequirementsTable
                            options={tableOptions}
                            planServantsData={planEditData.servantsData}
                            planRequirements={planRequirements}
                            selectedInstanceIds={selectedServantsData.ids}
                            targetCostumes={planEditData.costumes}
                            unlockedCostumes={masterAccountEditData.costumes}
                            onEditMasterItems={openEditItemsDialog}
                            onRowDoubleClick={handleRowDoubleClick}
                            onSelectionChange={updateServantSelection}
                        />
                    </div>
                </div>
            </div>
            <PlanRoutePlanServantEditDialog
                activeTab={planServantEditDialogActiveTab}
                dialogData={activeDialogInfo.name === 'planServantEdit' ? activeDialogInfo.data : undefined}
                targetPlanServantsData={selectedServantsData.instances}
                onTabChange={setPlanServantEditDialogActiveTab}
                onClose={handleEditServantDialogClose}
            />
            <PlanRoutePlanServantDeleteDialog
                dialogData={activeDialogInfo.name === 'planServantDelete' ? activeDialogInfo.data : undefined}
                onClose={handleDeleteServantDialogClose}
            />
            <PlanRouteMasterItemsEditDialog
                dialogData={activeDialogInfo.name === 'masterItemsEdit' ? activeDialogInfo.data : undefined}
                onClose={handleEditItemsDialogClose}
            />
            <RouteDataEditReloadOnStaleDataDialog
                open={activeDialogInfo.name === 'reloadOnStaleData'}
                onClose={handleReloadDataDialogClose}
            />
            <RouteDataEditSaveOnStaleDataDialog
                open={activeDialogInfo.name === 'saveOnStaleData'}
                onClose={handleSaveDataDialogClose}
            />
        </Box>
    );

    //#endregion

});
