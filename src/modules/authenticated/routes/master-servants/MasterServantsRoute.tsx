import { InstantiatedServantUpdateIndeterminateValue as IndeterminateValue, InstantiatedServantUpdateUtils, InstantiatedServantUtils, MasterServantConstants, MasterServantUpdate, MasterServantUpdateUtils } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useSelectedInstancesHelper } from '../../../../hooks/user-interface/list-select-helper/use-selected-instances-helper.hook';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { useDragDropHelper } from '../../../../hooks/user-interface/use-drag-drop-helper.hook';
import { useNavigationDrawerNoAnimations } from '../../../../hooks/user-interface/use-navigation-drawer-no-animations.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { EditDialogAction, MasterServantAggregatedData, ModalOnCloseReason, SortDirection, SortOptions } from '../../../../types';
import { DataAggregationUtils } from '../../../../utils/data-aggregation.utils';
import { RouteDataEditControls } from '../../components/control/RouteDataEditControls';
import { RouteDataEditReloadOnStaleDataDialog } from '../../components/control/RouteDataEditReloadOnStaleDataDialog';
import { RouteDataEditSaveOnStaleDataDialog } from '../../components/control/RouteDataEditSaveOnStaleDataDialog';
import { MasterServantEditDialog } from '../../components/master/servant/edit-dialog/MasterServantEditDialog';
import { MasterServantEditDialogData } from '../../components/master/servant/edit-dialog/MasterServantEditDialogData.type';
import { MasterServantListColumn, MasterServantListVisibleColumns } from '../../components/master/servant/list/master-servant-list-columns';
import { MasterServantList } from '../../components/master/servant/list/master-servant-list.component';
import { StyleClassPrefix as MasterServantListStyleClassPrefix } from '../../components/master/servant/list/master-servant-list.style';
import { MasterAccountDataEditHookOptions, useMasterAccountDataEdit } from '../../hooks/useMasterAccountDataEdit';
import { MasterServantsRouteDeleteDialog, MasterServantsRouteDeleteDialogData } from './components/MasterServantsRouteDeleteDialog';
import { MasterServantsFilter, MasterServantsRouteFilterControls } from './components/MasterServantsRouteFilterControls';
import { MasterServantsRouteInfoPanel } from './components/MasterServantsRouteInfoPanel';
import { MasterServantsRouteMultiAddDialog, MasterServantsRouteMultiAddDialogData } from './components/MasterServantsRouteMultiAddDialog';
import { MasterServantsRouteNavigationRail } from './components/MasterServantsRouteNavigationRail';
import { MasterServantsRouteServantRowContextMenu } from './components/MasterServantsRouteServantRowContextMenu';
import { useMasterServantsRouteModalState } from './hooks/useMasterServantsRouteModalState';
import { useMasterServantsRouteUserPreferences } from './hooks/useMasterServantsRouteUserPreferences';

// TODO Use `satisfies` keyword instead of `as` once Typescript is updated to version 4.9.
const masterAccountDataEditHookOptions = {
    includeCostumes: true,
    includeServants: true
} as MasterAccountDataEditHookOptions;

const StyleClassPrefix = 'MasterServantsRoute';

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
    } = useMasterAccountDataEdit(masterAccountDataEditHookOptions);

    const {
        dragDropData,
        startDragDrop,
        endDragDrop,
        handleDragOrderChange
    } = useDragDropHelper<MasterServantAggregatedData>(InstantiatedServantUtils.getInstanceId);

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
            showUnsummonedServants
        },
        setServantEditDialogActiveTab,
        toggleFilters,
        toggleInfoPanelOpen,
        toggleShowUnsummonedServants
    } = useMasterServantsRouteUserPreferences();

    const {
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
    } = useMasterServantsRouteModalState();

    // TODO Move this to user preferences
    const [sortOptions, setSortOptions] = useState<SortOptions<MasterServantListColumn>>();

    const {
        selectedData: selectedServantsData,
        selectAll: selectAllServants,
        deselectAll: deselectAllServants,
        updateSelection: updateServantSelection
    } = useSelectedInstancesHelper(
        masterAccountEditData.servantsData,
        InstantiatedServantUtils.getInstanceId
    );

    const [servantFilter, setServantFilter] = useState<MasterServantsFilter>();

    const { sm, md } = useActiveBreakpoints();

    // TODO Make this user configurable...
    const visibleColumns = useMemo((): MasterServantListVisibleColumns => ({
        npLevel: sm,
        level: sm,
        bondLevel: sm,
        fouHp: sm,
        fouAtk: sm,
        skills: sm,
        appendSkills: sm,
        summonDate: sm
    }), [sm]);


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

        const gameId = MasterServantConstants.DefaultServantId;
        const masterServantEditDialogData: MasterServantEditDialogData = {
            action: EditDialogAction.Add,
            data: {
                gameId,
                update: MasterServantUpdateUtils.createNew(gameId, bondLevels, costumes),
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

        const masterServantEditDialogData: MasterServantEditDialogData = {
            action: EditDialogAction.Edit,
            data: {
                gameId: IndeterminateValue,
                update: MasterServantUpdateUtils.createFromExisting(selectedServants, bondLevels, costumes),
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
        /**
         * Deselect servants...servant selection is not allowed in drag-drop mode.
         */
        deselectAllServants();
        startDragDrop(masterAccountEditData.servantsData);
    }, [deselectAllServants, masterAccountEditData, startDragDrop]);

    const handleDragDropApply = useCallback(() => {
        const updatedInstanceIdOrder = endDragDrop();
        if (!updatedInstanceIdOrder) {
            return;
        }
        updateServantOrder(updatedInstanceIdOrder);
    }, [endDragDrop, updateServantOrder]);

    const handleDragDropCancel = useCallback(() => {
        endDragDrop();
    }, [endDragDrop]);

    //#endregion


    //#region Servant list event handlers

    const handleRowClick = useCallback((e: MouseEvent): void => {
        if (e.type === 'contextmenu') {
            openContextMenu('row', e);
        }
    }, [openContextMenu]);

    const handleRowDoubleClick = openEditServantDialog;

    const handleHeaderClick = useCallback((e: MouseEvent) => {
        console.log('handleHeaderClick', e);
        if (e.type === 'contextmenu') {
            openContextMenu('header', e);
        }
    }, [openContextMenu]);

    const handleSortChange = useCallback((column?: MasterServantListColumn, direction: SortDirection = 'asc'): void => {
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
        if (data && data.gameIds.length) {
            const servantData = MasterServantUpdateUtils.createNew();
            servantData.summoned = InstantiatedServantUpdateUtils.fromBoolean(data.summoned);
            addServants(data.gameIds, servantData);
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
            const { gameId, update } = data.data;
            addServant(gameId, update);
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
        servantsData,
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
                    onMultiAddServant={handleMultiAddServant}
                    onDeleteSelectedServants={handleDeleteSelectedServants}
                    onDragDropActivate={handleDragDropActivate}
                    onDragDropApply={handleDragDropApply}
                    onDragDropCancel={handleDragDropCancel}
                    onEditSelectedServants={handleEditSelectedServants}
                    onOpenColumnSettings={() => { }}
                    onToggleFilters={toggleFilters}
                    onToggleShowUnsummonedServants={toggleShowUnsummonedServants}
                />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                        <MasterServantList
                            masterServantsData={dragDropData || servantsData}
                            bondLevels={bondLevels}
                            selectedInstanceIds={selectedServantsData.ids}
                            showHeader={sm}
                            visibleColumns={visibleColumns}
                            dragDropMode={dragDropMode}
                            sortOptions={sortOptions}
                            showUnsummonedServants={showUnsummonedServants}
                            textFilter={servantFilter?.searchText}
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
                dialogData={activeDialogInfo.name === 'masterServantEdit' ? activeDialogInfo.data : undefined}
                targetMasterServantsData={selectedServantsData.instances}
                activeTab={servantEditDialogActiveTab}
                onTabChange={setServantEditDialogActiveTab}
                onClose={handleEditServantDialogClose}
            />
            <MasterServantsRouteMultiAddDialog
                open={activeDialogInfo.name === 'masterServantMultiAdd'}
                masterServantsData={masterAccountEditData.servantsData}
                onClose={handleMultiAddServantDialogClose}
            />
            <MasterServantsRouteDeleteDialog
                dialogData={activeDialogInfo.name === 'masterServantDelete' ? activeDialogInfo.data : undefined}
                onClose={handleDeleteServantDialogClose}
            />
            <RouteDataEditReloadOnStaleDataDialog
                open={activeDialogInfo.name === 'reloadOnStaleData'}
                onClose={handleReloadDataDialogClose}
            />
            <RouteDataEditSaveOnStaleDataDialog
                open={activeDialogInfo.name === 'saveOnStaleData'}
                onClose={handleSaveDataDialogClose}
            />
            <MasterServantsRouteServantRowContextMenu
                open={activeContextMenu === 'row'}
                position={contextMenuPosition}
                selectedServantsCount={selectedServantsCount}
                onAddServant={handleAddServant}
                onDeleteSelectedServants={handleDeleteSelectedServants}
                onEditSelectedServants={handleEditSelectedServants}
                onSelectAllServants={handleSelectAllServants}
                onDeselectAllServants={handleDeselectAllServants}
                onClose={closeActiveContextMenu}
            />
        </Box>
    );

    //#endregion

});
