import { InstantiatedServantUpdateIndeterminateValue as IndeterminateValue, InstantiatedServantUpdateUtils, InstantiatedServantUtils, MasterServantAggregatedData, MasterServantConstants, MasterServantUpdate, MasterServantUpdateUtils } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useGameServantMap } from '../../../../hooks/data/useGameServantMap';
import { useSelectedInstancesHelper } from '../../../../hooks/user-interface/list-select-helper/useSelectedInstancesHelper';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/useActiveBreakpoints';
import { useDragDropState } from '../../../../hooks/user-interface/useDragDropState';
import { useNavigationDrawerNoAnimations } from '../../../../hooks/user-interface/useNavigationDrawerNoAnimations';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { EditDialogAction, ModalOnCloseReason, SortDirection, SortOptions } from '../../../../types';
import { DataAggregationUtils } from '../../../../utils/DataAggregationUtils';
import { MasterAccountUtils } from '../../../../utils/master/MasterAccountUtils';
import { RouteDataEditControls } from '../../components/control/RouteDataEditControls';
import { RouteDataEditReloadOnStaleDataDialog } from '../../components/control/RouteDataEditReloadOnStaleDataDialog';
import { RouteDataEditSaveOnStaleDataDialog } from '../../components/control/RouteDataEditSaveOnStaleDataDialog';
import { MasterServantEditDialog } from '../../components/master/servant/edit-dialog/MasterServantEditDialog';
import { MasterServantEditDialogData } from '../../components/master/servant/edit-dialog/MasterServantEditDialogData.type';
import { MasterServantList } from '../../components/master/servant/list/MasterServantList';
import { MasterServantListColumn } from '../../components/master/servant/list/MasterServantListColumn';
import { StyleClassPrefix as MasterServantListStyleClassPrefix } from '../../components/master/servant/list/MasterServantListStyle';
import { MasterAccountDataEditHookOptions, useMasterAccountDataEdit } from '../../hooks/useMasterAccountDataEdit';
import { MasterServantsRouteColumnSettingsDialog, MasterServantsRouteColumnSettingsDialogData } from './components/MasterServantsRouteColumnSettingsDialog';
import { MasterServantsRouteDeleteDialog, MasterServantsRouteDeleteDialogData } from './components/MasterServantsRouteDeleteDialog';
import { MasterServantsFilter, MasterServantsRouteFilterControls } from './components/MasterServantsRouteFilterControls';
import { MasterServantsRouteHeaderContextMenu } from './components/MasterServantsRouteHeaderContextMenu';
import { MasterServantsRouteInfoPanel } from './components/MasterServantsRouteInfoPanel';
import { MasterServantsRouteMultiAddDialog, MasterServantsRouteMultiAddDialogData } from './components/MasterServantsRouteMultiAddDialog';
import { MasterServantsRouteNavigationRail } from './components/MasterServantsRouteNavigationRail';
import { MasterServantsRouteServantRowContextMenu } from './components/MasterServantsRouteServantRowContextMenu';
import { useMasterServantsRouteModalState } from './hooks/useMasterServantsRouteModalState';
import { useMasterServantsRouteUserPreferences } from './hooks/useMasterServantsRouteUserPreferences';

const MasterAccountDataEditOptions = {
    includeCostumes: true,
    includeServants: true
} as const satisfies MasterAccountDataEditHookOptions;

const StyleClassPrefix = 'MasterServantsRouteRoute';

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
                [`& .${StyleClassPrefix}-list-container`]: {
                    flex: 1,
                    overflow: 'hidden',
                    [`& .${MasterServantListStyleClassPrefix}-root`]: {
                        borderRightWidth: 1,
                        borderRightStyle: 'solid',
                        borderRightColor: palette.divider
                    }
                },
                [`& .${StyleClassPrefix}-info-panel-container`]: {
                    height: '100%',
                    boxSizing: 'border-box',
                    [breakpoints.down('md')]: {
                        display: 'none'
                    }
                },
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

export const MasterServantsRoute = React.memo(() => {

    useNavigationDrawerNoAnimations();

    const gameServantMap = useGameServantMap();

    const {
        awaitingRequest,
        isDataDirty,
        isDataStale,
        masterAccountEditData,
        addServant,
        addServants,
        updateServants,
        updateServantOrder,
        deleteServants,
        reloadData,
        revertChanges,
        persistChanges
    } = useMasterAccountDataEdit(MasterAccountDataEditOptions);

    const {
        dragDropData,
        startDragDrop,
        endDragDrop,
        handleDragOrderChange
    } = useDragDropState<MasterServantAggregatedData>();

    /**
     * Need to exit drag-drop mode whenever the `masterAccountEditData` reference
     * changes. This should only happen when the user switches accounts or reverts
     * the edit data.
     */
    useEffect(() => {
        endDragDrop();
    }, [endDragDrop, masterAccountEditData]);

    /**
     * Whether drag-drop mode is active. Drag-drop mode is intended for the user to
     * rearrange the default ordering of the list. As such, when in drag-drop mode,
     * the full list in the current default order is visible, regardless of any
     * filter or visibility settings.
     */
    const dragDropMode = !!dragDropData;

    const {
        userPreferences: {
            filtersEnabled,
            infoPanelOpen,
            servantEditDialogActiveTab,
            showUnsummonedServants,
            visibleColumns
        },
        setServantEditDialogActiveTab,
        setVisibleColumns,
        toggleFilters,
        toggleInfoPanelOpen,
        toggleShowUnsummonedServants
    } = useMasterServantsRouteUserPreferences();

    const {
        activeContextMenu,
        activeDialog,
        contextMenuPosition,
        closeActiveContextMenu,
        closeActiveDialog,
        openColumnSettingsDialog,
        openHeaderContextMenu,
        openMasterServantDeleteDialog,
        openMasterServantEditDialog,
        openMasterServantMultiAddDialog,
        openReloadOnStaleDataDialog,
        openSaveOnStaleDataDialog,
        openServantRowContextMenu
    } = useMasterServantsRouteModalState();

    // TODO Move this to user preferences
    const [sortOptions, setSortOptions] = useState<SortOptions<MasterServantListColumn.Name>>();

    const {
        selectedData: selectedServantsData,
        selectAll: selectAllServants,
        deselectAll: deselectAllServants,
        updateSelection: updateServantSelection
    } = useSelectedInstancesHelper(
        masterAccountEditData.aggregatedServants,
        InstantiatedServantUtils.getInstanceId
    );

    const [servantFilter, setServantFilter] = useState<MasterServantsFilter>();

    const { sm, md } = useActiveBreakpoints();


    //#region Internal helper functions

    /**
     * Applies the submitted edit to the currently selected servants.
     */
    const applyUpdateToSelectedServants = useCallback((update: MasterServantUpdate) => {
        updateServants(selectedServantsData.ids, update);
    }, [selectedServantsData, updateServants]);

    const openAddServantDialog = useCallback((): void => {
        const {
            bondLevels,
            costumes
        } = masterAccountEditData;

        const servantId = MasterServantConstants.DefaultServantId;
        const unlockedCostumes = MasterAccountUtils.unlockedCostumesMapToIdSet(costumes);
        const masterServantEditDialogData: MasterServantEditDialogData = {
            action: EditDialogAction.Add,
            data: {
                servantId,
                update: MasterServantUpdateUtils.createNew(servantId, bondLevels, unlockedCostumes),
                bondLevels
            }
        };
        openMasterServantEditDialog(masterServantEditDialogData);
    }, [masterAccountEditData, openMasterServantEditDialog]);

    const openEditServantDialog = useCallback((): void => {
        if (!selectedServantsData.instances.length) {
            return;
        }
        const selectedServants = selectedServantsData.instances.map(DataAggregationUtils.getMasterServant);

        const {
            bondLevels,
            costumes
        } = masterAccountEditData;

        const unlockedCostumes = MasterAccountUtils.unlockedCostumesMapToIdSet(costumes);
        const masterServantEditDialogData: MasterServantEditDialogData = {
            action: EditDialogAction.Edit,
            data: {
                servantId: IndeterminateValue,
                update: MasterServantUpdateUtils.createFromExisting(selectedServants, bondLevels, unlockedCostumes),
                bondLevels
            }
        };
        openMasterServantEditDialog(masterServantEditDialogData);
    }, [masterAccountEditData, openMasterServantEditDialog, selectedServantsData]);

    const openDeleteServantDialog = useCallback((): void => {
        if (!selectedServantsData.instances.length) {
            return;
        }
        openMasterServantDeleteDialog({
            targetMasterServantsData: selectedServantsData.instances
        });
    }, [openMasterServantDeleteDialog, selectedServantsData]);

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

    const handleMultiAddServant = useCallback(() => {
        openMasterServantMultiAddDialog();
    }, [openMasterServantMultiAddDialog]);

    const handleDragDropActivate = useCallback(() => {
        startDragDrop(masterAccountEditData.aggregatedServants);
    }, [masterAccountEditData, startDragDrop]);

    const handleDragDropApply = useCallback(() => {
        const updatedServantOrder = endDragDrop();
        if (!updatedServantOrder) {
            return;
        }
        updateServantOrder(updatedServantOrder.map(InstantiatedServantUtils.getInstanceId));
    }, [endDragDrop, updateServantOrder]);

    const handleDragDropCancel = useCallback(() => {
        endDragDrop();
    }, [endDragDrop]);

    //#endregion


    //#region Servant list event handlers

    const handleRowClick = useCallback((event: MouseEvent): void => {
        if (event.type === 'contextmenu') {
            openServantRowContextMenu(event);
        }
    }, [openServantRowContextMenu]);

    const handleRowDoubleClick = openEditServantDialog;

    const handleHeaderClick = useCallback((event: MouseEvent) => {
        console.log('handleHeaderClick', event);
        if (event.type === 'contextmenu') {
            openHeaderContextMenu(event);
        }
    }, [openHeaderContextMenu]);

    const handleSortChange = useCallback((column?: MasterServantListColumn.Name, direction: SortDirection = 'asc'): void => {
        /**
         * Deselect servants when changing sort. This is consistent with Google Drive
         * behavior.
         */
        deselectAllServants();
        setSortOptions({
            sort: column,
            direction
        });
    }, [deselectAllServants]);

    //#endregion


    //#region Context menu event handlers

    const handleSelectAllServants = selectAllServants;

    const handleDeselectAllServants = deselectAllServants;

    //#endregion


    //#region Common event handlers

    const handleAddServant = openAddServantDialog;

    const handleEditSelectedServants = openEditServantDialog;

    const handleDeleteSelectedServants = openDeleteServantDialog;

    const handleOpenColumnSettings = useCallback((): void => {
        openColumnSettingsDialog({ visibleColumns });
    }, [openColumnSettingsDialog, visibleColumns]);

    //#endregion


    //#region Other event handlers

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

    const handleMultiAddServantDialogClose = useCallback((
        _event: any,
        _reason: any,
        data?: MasterServantsRouteMultiAddDialogData
    ): void => {
        if (data && data.servantIds.length) {
            const servantData = MasterServantUpdateUtils.createNew();
            servantData.summoned = InstantiatedServantUpdateUtils.fromBoolean(data.summoned);
            addServants(data.servantIds, servantData);
        }
        closeActiveDialog();
    }, [addServants, closeActiveDialog]);

    const handleEditServantDialogClose = useCallback((
        _event: any,
        _reason: any,
        data?: MasterServantEditDialogData
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
            const { servantId, update } = data.data;
            addServant(servantId, update);
        } else {
            applyUpdateToSelectedServants(data.data.update);
        }
        /**
         * Should not be possible for update type to be `Imported` here.
         */
    }, [addServant, applyUpdateToSelectedServants, closeActiveDialog]);

    const handleDeleteServantDialogClose = useCallback((
        _event: MouseEvent,
        _reason: ModalOnCloseReason,
        data?: MasterServantsRouteDeleteDialogData
    ): void => {
        closeActiveDialog();
        /**
         * Close the dialog without taking any further action if the changes were
         * cancelled (if `data` is undefined, then the changes were cancelled).
         */
        if (!data) {
            return;
        }
        deleteServants(data.targetMasterServantsData.map(InstantiatedServantUtils.getInstanceId));
    }, [closeActiveDialog, deleteServants]);

    const handleColumnSettingsDialogClose = useCallback((
        _event: MouseEvent,
        _reason: ModalOnCloseReason,
        data?: MasterServantsRouteColumnSettingsDialogData
    ): void => {
        closeActiveDialog();
        /**
         * Close the dialog without taking any further action if the changes were
         * cancelled (if `data` is undefined, then the changes were cancelled).
         */
        if (!data) {
            return;
        }
        setVisibleColumns(data.visibleColumns);
    }, [closeActiveDialog, setVisibleColumns]);

    // const handleFilterChange = useCallback((filter: MasterServantsFilter): void => {
    //     setServantFilter(filter);
    // }, []);

    //#endregion


    //#region Component rendering

    /**
     * This can be undefined during the initial render.
     */
    if (!gameServantMap) {
        return null;
    }

    const selectedServantsCount = selectedServantsData.ids.size;

    const {
        aggregatedServants,
        bondLevels,
        costumes
    } = masterAccountEditData;

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-upper-layout-container`}>
                <RouteDataEditControls
                    disabled={awaitingRequest}
                    isDataDirty={isDataDirty}
                    isDataStale={isDataStale}
                    title='Servant Roster'
                    onReloadButtonClick={handleReloadButtonClick}
                    onRevertButtonClick={handleRevertButtonClick}
                    onSaveButtonClick={handleSaveButtonClick}
                />
                <MasterServantsRouteFilterControls
                    filtersEnabled={filtersEnabled}
                    onFilterChange={setServantFilter}
                />
            </div>
            <div className={`${StyleClassPrefix}-lower-layout-container`}>
                <MasterServantsRouteNavigationRail
                    layout={sm ? 'column' : 'row'}
                    dragDropMode={dragDropMode}
                    filtersEnabled={filtersEnabled}
                    showUnsummonedServants={showUnsummonedServants}
                    selectedServantsCount={selectedServantsCount}
                    onAddServant={handleAddServant}
                    onDeleteSelectedServants={handleDeleteSelectedServants}
                    onDragDropActivate={handleDragDropActivate}
                    onDragDropApply={handleDragDropApply}
                    onDragDropCancel={handleDragDropCancel}
                    onEditSelectedServants={handleEditSelectedServants}
                    onMultiAddServant={handleMultiAddServant}
                    onOpenColumnSettings={handleOpenColumnSettings}
                    onToggleFilters={toggleFilters}
                    onToggleShowUnsummonedServants={toggleShowUnsummonedServants}
                />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                        <MasterServantList
                            bondLevels={bondLevels}
                            dragDropMode={dragDropMode}
                            hideStatColumns={!sm}
                            masterServantsData={dragDropData || aggregatedServants}
                            selectedInstanceIds={selectedServantsData.ids}
                            showHeader={sm}
                            showUnsummonedServants={showUnsummonedServants}
                            sortOptions={sortOptions}
                            textFilter={servantFilter?.searchText}
                            virtualList={false} // TODO Make this configurable
                            visibleColumns={visibleColumns}
                            onDragOrderChange={handleDragOrderChange}
                            onHeaderClick={handleHeaderClick}
                            onRowClick={handleRowClick}
                            onRowDoubleClick={handleRowDoubleClick}
                            onSelectionChange={updateServantSelection}
                            onSortChange={handleSortChange}
                        />
                    </div>
                    <div className={`${StyleClassPrefix}-info-panel-container`}>
                        <MasterServantsRouteInfoPanel
                            /**
                             * TODO Change this to false for mobile view, also make it user configurable.
                             */
                            keepChildrenMounted
                            activeServantsData={selectedServantsData.instances}
                            bondLevels={bondLevels}
                            unlockedCostumes={costumes}
                            // editMode={editMode}
                            open={infoPanelOpen && md}
                            onOpenToggle={toggleInfoPanelOpen}
                        />
                    </div>
                </div>
            </div>
            <MasterServantEditDialog
                dialogData={activeDialog.name === 'masterServantEdit' ? activeDialog.data : undefined}
                targetMasterServantsData={selectedServantsData.instances}
                activeTab={servantEditDialogActiveTab}
                onTabChange={setServantEditDialogActiveTab}
                onClose={handleEditServantDialogClose}
            />
            <MasterServantsRouteMultiAddDialog
                open={activeDialog.name === 'masterServantMultiAdd'}
                masterServantsData={masterAccountEditData.aggregatedServants}
                onClose={handleMultiAddServantDialogClose}
            />
            <MasterServantsRouteDeleteDialog
                dialogData={activeDialog.name === 'masterServantDelete' ? activeDialog.data : undefined}
                onClose={handleDeleteServantDialogClose}
            />
            <RouteDataEditReloadOnStaleDataDialog
                open={activeDialog.name === 'reloadOnStaleData'}
                onClose={handleReloadDataDialogClose}
            />
            <RouteDataEditSaveOnStaleDataDialog
                open={activeDialog.name === 'saveOnStaleData'}
                onClose={handleSaveDataDialogClose}
            />
            <MasterServantsRouteColumnSettingsDialog
                dialogData={activeDialog.name === 'columnSettings' ? activeDialog.data : undefined}
                onClose={handleColumnSettingsDialogClose}
            />
            <MasterServantsRouteHeaderContextMenu
                open={activeContextMenu.name === 'header'}
                position={contextMenuPosition}
                onClose={closeActiveContextMenu}
                onOpenColumnSettings={handleOpenColumnSettings}
            />
            <MasterServantsRouteServantRowContextMenu
                open={activeContextMenu.name === 'row'}
                position={contextMenuPosition}
                selectedServantsCount={selectedServantsCount}
                onAddServant={handleAddServant}
                onClose={closeActiveContextMenu}
                onDeleteSelectedServants={handleDeleteSelectedServants}
                onDeselectAllServants={handleDeselectAllServants}
                onEditSelectedServants={handleEditSelectedServants}
                onSelectAllServants={handleSelectAllServants}
            />
        </Box>
    );

    //#endregion

});
