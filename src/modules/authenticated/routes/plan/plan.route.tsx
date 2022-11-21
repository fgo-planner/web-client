import { CollectionUtils, Functions, Immutable } from '@fgo-planner/common-core';
import { InstantiatedServantUpdateIndeterminateValue as IndeterminateValue, InstantiatedServantUtils, PlanServant, PlanServantUpdate, PlanServantUpdateUtils } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PathPattern } from 'react-router';
import { useMatch, useNavigate } from 'react-router-dom';
import { RouteDataEditControls } from '../../../../components/control/route-data-edit-controls.component';
import { PlanRequirementsTableOptions } from '../../../../components/plan/requirements/table/plan-requirements-table-options.type';
import { PlanRequirementsTable } from '../../../../components/plan/requirements/table/plan-requirements-table.component';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useSelectedInstancesHelper } from '../../../../hooks/user-interface/list-select-helper/use-selected-instances-helper.hook';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { useDragDropHelper } from '../../../../hooks/user-interface/use-drag-drop-helper.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { EditDialogAction, MasterServantAggregatedData, ModalOnCloseReason, PlanRequirements, PlanServantAggregatedData } from '../../../../types';
import { GameServantUtils } from '../../../../utils/game/game-servant.utils';
import { PlanComputationUtils } from '../../../../utils/plan/plan-computation.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { usePlanDataEdit } from '../../hooks/use-plan-data-edit.hook';
import { PlanNavigationRail } from './components/plan-navigation-rail.component';
import { PlanServantEditDialogData } from './components/plan-servant-edit-dialog-data.type';
import { PlanServantEditDialog } from './components/plan-servant-edit-dialog.component';

const instantiateDefaultTableOptions = (): PlanRequirementsTableOptions => ({
    layout: {
        cells: 'normal',
        stickyColumn: 'normal'
    },
    displayItems: {
        unused: true,
        statues: true,
        gems: true,
        lores: true,
        grails: true,
        embers: true,
        fous: true
    }
});

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
        palette,
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
                    overflow: 'hidden',
                    // [`& .${MasterServantListStyleClassPrefix}-root`]: {
                    //     borderRightWidth: 1,
                    //     borderRightStyle: 'solid',
                    //     borderRightColor: palette.divider
                    // }
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

    const {
        selectedData: selectedServantsData,
        selectAll: selectAllServants,
        deselectAll: deselectAllServants,
        updateSelection: updateServantSelection
    } = useSelectedInstancesHelper(
        planEditData.servantsData, 
        InstantiatedServantUtils.getInstanceId
    );

    /**
     * Master servants that have not been added to the plan yet.
     */
    const [availableServants, setAvailableServants] = useState<ReadonlyArray<MasterServantAggregatedData>>(CollectionUtils.emptyArray);

    /**
     * Whether the multi-add servant dialog is open.
     */
    const [isMultiAddServantDialogOpen, setIsMultiAddServantDialogOpen] = useState<boolean>(false);

    /**
     * The `PlanServantEditDialogData` DTO that is passed directly into and modified
     * by the dialog. The original plan servant is not modified until the changes
     * are submitted.
     *
     * The `open` state of the servant edit dialog is also determined by whether
     * this data is present (dialog is opened if data is defined, and closed if data
     * is undefined).
     */
    const [editServantDialogData, setEditServantDialogData] = useState<PlanServantEditDialogData>();

    /**
     * Contains the message prompt that is displayed by the delete servant dialog.
     *
     * The `open` state of the delete servant dialog is also determined by whether
     * this data is present (dialog is opened if data is defined, and closed if data
     * is undefined).
     */
    const [deleteServantDialogData, setDeleteServantDialogData] = useState<ReactNode>();


    const [showAppendSkills, setShowAppendSkills] = useState<boolean>(true); // TODO Change this back to false
    const [tableOptions, setTableOptions] = useState<PlanRequirementsTableOptions>(instantiateDefaultTableOptions);

    /**
     * Clone of the servant that is being edited by the servant edit dialog. This
     * data is passed directly into and modified by the dialog. The original data is
     * not modified until the changes are submitted.
     */
    const [editServantTarget, setEditServantTarget] = useState<PlanServant>();
    /**
     * Reference to the original data of the servant that is being edited.
     *
     * When adding a new servant, this will remain `undefined`.
     */
    const editServantTargetRef = useRef<Immutable<PlanServant>>();
    // const [editServantDialogOpen, setEditServantDialogOpen] = useState<boolean>(false);

    const [deleteServantTarget, setDeleteServantTarget] = useState<PlanServant>();
    const [deleteServantDialogOpen, setDeleteServantDialogOpen] = useState<boolean>(false);

    const { sm, md } = useActiveBreakpoints();

    const planRequirements = useMemo((): PlanRequirements | null => {
        if (!gameServantMap || !masterAccountEditData || !planId) {
            return null;
        }
        const planRequirements = PlanComputationUtils.computePlanRequirements(
            {
                planId,
                ...planEditData
            },
            masterAccountEditData
            // TODO Add previous plans
        );
        console.log(planRequirements);
        return planRequirements;
    }, [gameServantMap, masterAccountEditData, planEditData, planId]);


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
    const deleteSelectedServants = useCallback((): void => {
        deletePlanServants(selectedServantsData.ids);
    }, [deletePlanServants, selectedServantsData]);

    const openAddServantDialog = useCallback((): void => {
        const editServantDialogData: PlanServantEditDialogData = {
            action: EditDialogAction.Add,
            data: {
                instanceId: IndeterminateValue,
                update: PlanServantUpdateUtils.createNew(planEditData.costumes)
            }
        };
        const availableServants = computeAvailableServants(planEditData.servantsData, masterAccountEditData.servantsData);
        setAvailableServants(availableServants);
        setEditServantDialogData(editServantDialogData);
        setIsMultiAddServantDialogOpen(false);
        setDeleteServantDialogData(undefined);
    }, [masterAccountEditData, planEditData]);

    const openMultiAddServantDialog = useCallback((): void => {
        setIsMultiAddServantDialogOpen(true);
        setEditServantDialogData(undefined);
        setDeleteServantDialogData(undefined);
    }, []);

    const openEditServantDialog = useCallback((): void => {
        if (!selectedServantsData.instances.length) {
            return;
        }
        const selectedServants = selectedServantsData.instances.map(servantData => servantData.planServant);
        const editServantDialogData: PlanServantEditDialogData = {
            action: EditDialogAction.Edit,
            data: {
                instanceId: IndeterminateValue,
                update: PlanServantUpdateUtils.createFromExisting(selectedServants, planEditData.costumes)
            }
        };
        setAvailableServants(CollectionUtils.emptyArray());
        setEditServantDialogData(editServantDialogData);
        setIsMultiAddServantDialogOpen(false);
        setDeleteServantDialogData(undefined);
    }, [planEditData, selectedServantsData]);

    const openDeleteServantDialog = useCallback((): void => {
        const deleteCount = selectedServantsData.instances.length;
        if (!deleteCount) {
            return;
        }
        // TODO Un-hardcode static strings.
        const prompt = <>
            <p>The following servant{deleteCount > 1 && 's'} will be deleted:</p>
            <ul>
                {selectedServantsData.instances.map(servantData => {
                    const displayedName = GameServantUtils.getDisplayedName(servantData.gameServant);
                    return <li>{displayedName}</li>;
                })}
            </ul>
            <p>Are you sure you want to proceed?</p>
        </>;
        setDeleteServantDialogData(prompt);
        setIsMultiAddServantDialogOpen(false);
        setEditServantDialogData(undefined);
    }, [selectedServantsData]);

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

    const handleToggleCellSize = useCallback((): void => {
        const layout = { ...tableOptions.layout };
        layout.cells = layout.cells === 'condensed' ? 'normal' : 'condensed';
        setTableOptions({
            ...tableOptions,
            layout
        });
    }, [tableOptions]);

    const handleToggleShowUnused = useCallback((): void => {
        const { displayItems } = tableOptions;
        displayItems.unused = !displayItems.unused;
        setTableOptions({
            ...tableOptions,
            displayItems: { ...displayItems }
        });
    }, [tableOptions]);

    //#endregion


    //#region Common event handlers

    const handleAddServant = openAddServantDialog;

    const handleEditSelectedServants = openEditServantDialog;

    const handleDeleteSelectedServants = openDeleteServantDialog;

    //#endregion


    //#region Other event handlers

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        editServantTargetRef.current = undefined;
        setEditServantTarget(undefined);
        setDeleteServantTarget(undefined);
        setDeleteServantDialogOpen(false);
        try {
            await persistChanges();
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
        }
        persistChanges();
    }, [persistChanges]);

    const handleRevertButtonClick = revertChanges;

    const handleEditServantDialogClose = useCallback((_event: any, _reason: any, data?: PlanServantEditDialogData): void => {
        setAvailableServants(CollectionUtils.emptyArray());
        setEditServantDialogData(undefined);
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
    }, [addPlanServant, applyUpdateToSelectedServants]);

    const handleDeleteServantDialogClose = useCallback((_event: MouseEvent, reason: ModalOnCloseReason): any => {
        if (reason === 'submit') {
            deleteSelectedServants();
        }
        setDeleteServantDialogData(undefined);
    }, [deleteSelectedServants]);

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
                <PlanNavigationRail
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
                    onToggleCellSize={handleToggleCellSize}
                    onToggleShowUnused={handleToggleShowUnused}
                />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <div className={clsx(`${StyleClassPrefix}-table-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                        <PlanRequirementsTable
                            masterItems={masterAccountEditData.items}
                            planServantsData={planEditData.servantsData}
                            planRequirements={planRequirements}
                            options={tableOptions}
                        />
                    </div>
                </div>
            </div>
            <PlanServantEditDialog
                availableServants={availableServants}
                dialogData={editServantDialogData}
                targetPlanServantsData={selectedServantsData.instances}
                activeTab='enhancements'
                onTabChange={Functions.identity}
                onClose={handleEditServantDialogClose}
            />
        </Box>
    );

    //#endregion

});
