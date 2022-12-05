import { CollectionUtils, Functions, Immutable } from '@fgo-planner/common-core';
import { InstantiatedServantUpdateIndeterminateValue as IndeterminateValue, InstantiatedServantUtils, PlanServantUpdate, PlanServantUpdateUtils } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect } from 'react';
import { PathPattern } from 'react-router';
import { useMatch, useNavigate } from 'react-router-dom';
import { RouteDataEditControls } from '../../../../components/control/route-data-edit-controls.component';
import { PlanRequirementsTable } from '../../../../components/plan/requirements/table/PlanRequirementsTable';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useSelectedInstancesHelper } from '../../../../hooks/user-interface/list-select-helper/use-selected-instances-helper.hook';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { useDragDropHelper } from '../../../../hooks/user-interface/use-drag-drop-helper.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { EditDialogAction, MasterServantAggregatedData, ModalOnCloseReason, PlanServantAggregatedData } from '../../../../types';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { usePlanDataEdit } from '../../hooks/use-plan-data-edit.hook';
import { PlanRouteNavigationRail } from './components/PlanRouteNavigationRail';
import { PlanRoutePlanServantDeleteDialog, PlanRoutePlanServantDeleteDialogData } from './components/PlanRoutePlanServantDeleteDialog';
import { PlanRoutePlanServantEditDialog } from './components/PlanRoutePlanServantEditDialog';
import { PlanRoutePlanServantEditDialogData } from './components/PlanRoutePlanServantEditDialogData.type';
import { usePlanRouteDialogState } from './hooks/usePlanRouteDialogState';
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

const StyleClassPrefix = 'Plan';

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
        addUpcomingResources,
        updateUpcomingResources,
        deleteUpcomingResources,
        awaitingRequest,
        isMasterAccountDataDirty,
        isPlanDataDirty,
        revertChanges,
        persistChanges
    } = usePlanDataEdit(planId);

    const {
        userPreferences: {
            table: tableOptions
        },
        // setServantEditDialogActiveTab,
        toggleCellSize,
        toggleRowHeaderMode,
        toggleShowEmptyColumns
    } = usePlanRouteUserPreferences();

    const {
        openDialogInfo,
        closeAllDialogs,
        openMasterItemsEditDialog,
        openMasterServantEditDialog,
        openPlanServantDeleteDialog,
        openPlanServantEditDialog,
        openPlanServantMultiAddDialog
    } = usePlanRouteDialogState();

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
                availableServants
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
                availableServants: CollectionUtils.emptyArray()
            }
        };
        openPlanServantEditDialog(planServantEditDialogData);
    }, [openPlanServantEditDialog, planEditData, selectedServantsData]);

    const openDeleteServantDialog = useCallback((): void => {
        if (!selectedServantsData.instances.length) {
            return;
        }
        openPlanServantDeleteDialog({
            targetPlanServantsData: selectedServantsData.instances
        });
    }, [openPlanServantDeleteDialog, selectedServantsData]);

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

    const handleRowDoubleClick = openEditServantDialog;

    // const handleHeaderClick = useCallback((e: MouseEvent) => {
    //     console.log('handleHeaderClick', e);
    //     if (e.type === 'contextmenu') {
    //         openContextMenu('header', e);
    //     }
    // }, [openContextMenu]);

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

    //#endregion


    //#region Common event handlers

    const handleAddServant = openAddServantDialog;

    const handleEditSelectedServants = openEditServantDialog;

    const handleDeleteSelectedServants = openDeleteServantDialog;

    //#endregion


    //#region Other event handlers

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        closeAllDialogs();
        try {
            await persistChanges();
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
        }
        persistChanges();
    }, [closeAllDialogs, persistChanges]);

    const handleRevertButtonClick = revertChanges;

    const handleEditServantDialogClose = useCallback((
        _event: MouseEvent,
        _reason: ModalOnCloseReason,
        data?: PlanRoutePlanServantEditDialogData
    ): void => {
        closeAllDialogs();
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
    }, [addPlanServant, applyUpdateToSelectedServants, closeAllDialogs]);

    const handleDeleteServantDialogClose = useCallback((
        _event: MouseEvent,
        _reason: ModalOnCloseReason,
        data?: PlanRoutePlanServantDeleteDialogData
    ): any => {
        closeAllDialogs();
        /**
         * Close the dialog without taking any further action if the changes were
         * cancelled (if `data` is undefined, then the changes were cancelled).
         */
        if (!data) {
            return;
        }
        deletePlanServants(data.targetPlanServantsData.map(InstantiatedServantUtils.getInstanceId));
    }, [closeAllDialogs, deletePlanServants]);

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
                    title={planEditData.name}
                    hasUnsavedData={isMasterAccountDataDirty || isPlanDataDirty}
                    onRevertButtonClick={handleRevertButtonClick}
                    onSaveButtonClick={handleSaveButtonClick}
                    disabled={awaitingRequest}
                />
            </div>
            <div className={`${StyleClassPrefix}-lower-layout-container`}>
                <PlanRouteNavigationRail
                    layout={sm ? 'column' : 'row'}
                    dragDropMode={dragDropMode}
                    selectedServantsCount={selectedServantsData.ids.size}
                    onAddServant={handleAddServant}
                    onMultiAddServant={handleMultiAddServant}
                    onDeleteSelectedServants={handleDeleteSelectedServants}
                    onDragDropActivate={handleDragDropActivate}
                    onDragDropApply={handleDragDropApply}
                    onDragDropCancel={handleDragDropCancel}
                    onEditSelectedServants={handleEditSelectedServants}
                    onOpenDisplaySettings={() => { }}
                    onToggleCellSize={toggleCellSize}
                    onToggleRowheaderMode={toggleRowHeaderMode}
                    onToggleShowUnused={toggleShowEmptyColumns}
                />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <div className={clsx(`${StyleClassPrefix}-table-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                        <PlanRequirementsTable
                            planServantsData={planEditData.servantsData}
                            planRequirements={planRequirements}
                            selectedInstanceIds={selectedServantsData.ids}
                            options={tableOptions}
                            onRowDoubleClick={handleRowDoubleClick}
                            onSelectionChange={updateServantSelection}
                        />
                    </div>
                </div>
            </div>
            <PlanRoutePlanServantEditDialog
                dialogData={openDialogInfo.name === 'planServantEdit' ? openDialogInfo.data : undefined}
                targetPlanServantsData={selectedServantsData.instances}
                activeTab='enhancements'
                onTabChange={Functions.identity}
                onClose={handleEditServantDialogClose}
            />
            <PlanRoutePlanServantDeleteDialog
                dialogData={openDialogInfo.name === 'planServantDelete' ? openDialogInfo.data : undefined}
                onClose={handleDeleteServantDialogClose}
            />
        </Box>
    );

    //#endregion

});
