import { MasterServant } from '@fgo-planner/types';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, ReactNode, useCallback, useMemo, useState } from 'react';
import { RouteDataEditControls } from '../../../../components/control/route-data-edit-controls.component';
import { PromptDialog } from '../../../../components/dialog/prompt-dialog.component';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { useDragDropHelper } from '../../../../hooks/user-interface/use-drag-drop-helper.hook';
import { useListSelectHelper } from '../../../../hooks/user-interface/use-multi-select-list-helper.hook';
import { useNavigationDrawerNoAnimations } from '../../../../hooks/user-interface/use-navigation-drawer-no-animations.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { ExistingMasterServantUpdate, Immutable, MasterServantUpdate, ModalOnCloseReason } from '../../../../types/internal';
import { MasterServantUpdateUtils } from '../../../../utils/master/master-servant-update.utils';
import { MasterServantListVisibleColumns } from '../../components/master/servant/list/master-servant-list-columns';
import { MasterServantList, StyleClassPrefix as MasterServantListStyleClassPrefix } from '../../components/master/servant/list/master-servant-list.component';
import { MasterAccountDataEditHookOptions, useMasterAccountDataEditHook } from '../../hooks/use-master-account-data-edit.hook';
import { MasterServantsEditDialog } from './components/master-servants-edit-dialog.component';
import { MasterServantsFilterControls } from './components/master-servants-filter-controls.component';
import { MasterServantsInfoPanel } from './components/master-servants-info-panel.component';
import { MasterServantsListRowContextMenu } from './components/master-servants-list-row-context-menu.component';
import { MasterServantsMultiAddDialog, MultiAddServantData } from './components/master-servants-multi-add-dialog.component';
import { MasterServantsNavigationRail } from './components/master-servants-navigation-rail.component';
import { useMasterServantsContextMenuState } from './hooks/use-master-servants-context-menu-state.hook';
import { useMasterServantsUserPreferencesHook } from './hooks/use-master-servants-user-preferences.hook';

const MasterAccountDataEditOptions: MasterAccountDataEditHookOptions = {
    includeCostumes: true,
    includeServants: true
};

const getInstanceId = ({ instanceId }: Immutable<MasterServant>): number => {
    return instanceId;
};

const StyleClassPrefix = 'MasterServants';

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
        masterAccountId,
        isDataDirty,
        masterAccountEditData,
        // updateCostumes,
        addServant,
        addServants,
        updateServants,
        updateServantOrder,
        deleteServants,
        revertChanges,
        persistChanges
    } = useMasterAccountDataEditHook(MasterAccountDataEditOptions);

    const {
        dragDropData,
        startDragDrop,
        endDragDrop,
        handleDragOrderChange
    } = useDragDropHelper(getInstanceId);

    /**
     * Whether drag-drop mode is active. Drag-drop mode is intended for the user to
     * rearrange the default ordering of the list. As such, when in drag-drop mode,
     * the full list in the current default order is visible, regardless of any
     * filter or visibility settings.
     */
    const dragDropMode = !!dragDropData;

    const {
        activeContextMenu,
        contextMenuPosition,
        closeContextMenu,
        openHeaderContextMenu,
        openRowContextMenu
    } = useMasterServantsContextMenuState();

    const {
        selectedData: selectedServantData,
        selectAll: selectAllServants,
        selectNone: deselectServants,
        handleItemClick: handleServantClick,
    } = useListSelectHelper(masterAccountEditData.servants, getInstanceId, {
        disabled: dragDropMode,
        multiple: true,
        rightClickBehavior: 'contextmenu',
        onContextMenu: openRowContextMenu,
    });

    const {
        userPreferences: {
            filtersEnabled,
            infoPanelOpen,
            showUnsummonedServants
        },
        toggleFilters,
        toggleInfoPanelOpen,
        toggleShowUnsummonedServants
    } = useMasterServantsUserPreferencesHook(masterAccountId);

    const [awaitingRequest, setAwaitingRequest] = useState<boolean>(false);

    /**
     * Whether the multi-add servant dialog is open.
     */
    const [isMultiAddServantDialogOpen, setIsMultiAddServantDialogOpen] = useState<boolean>(false);

    /**
     * Contains a copy of the target servants' data that is passed directly into and
     * modified by the dialog. The original data is not modified until the changes
     * are submitted.
     *
     * The `open` state of the servant edit dialog is also determined by whether
     * this data is present (dialog is opened if data is defined, and closed if data
     * is undefined).
     */
    const [editServantDialogData, setEditServantDialogData] = useState<MasterServantUpdate>();

    /**
     * Contains the message prompt that is displayed by the delete servant dialog.
     *
     * The `open` state of the delete servant dialog is also determined by whether
     * this data is present (dialog is opened if data is defined, and closed if data
     * is undefined).
     */
    const [deleteServantDialogData, setDeleteServantDialogData] = useState<ReactNode>();

    // TODO No way to toggle this right now...
    const [showAppendSkills,] = useState<boolean>(true);

    const { sm, md } = useActiveBreakpoints();

    // TODO Make this user configurable...
    const visibleColumns = useMemo((): MasterServantListVisibleColumns => ({
        npLevel: sm,
        level: sm,
        bondLevel: sm,
        fouHp: sm,
        fouAtk: sm,
        skills: sm,
        appendSkills: sm && showAppendSkills
    }), [showAppendSkills, sm]);


    //#region Internal helper functions

    /**
     * Applies the submitted edit to the currently selected servants.
     */
    const applyUpdateToSelectedServants = useCallback((update: ExistingMasterServantUpdate) => {
        updateServants(selectedServantData.selectedIds, update);
    }, [selectedServantData, updateServants]);

    /**
     * Deletes the currently selected servants.
     */
    const deleteSelectedServants = useCallback((): void => {
        deleteServants(selectedServantData.selectedIds);
    }, [deleteServants, selectedServantData]);

    const openAddServantDialog = useCallback((): void => {
        const {
            bondLevels,
            costumes
        } = masterAccountEditData;

        const editServantDialogData = MasterServantUpdateUtils.instantiateForNewServant(bondLevels, costumes);
        setEditServantDialogData(editServantDialogData);
        setIsMultiAddServantDialogOpen(false);
        setDeleteServantDialogData(undefined);
    }, [masterAccountEditData]);

    const openMultiAddServantDialog = useCallback((): void => {
        setIsMultiAddServantDialogOpen(true);
        setEditServantDialogData(undefined);
        setDeleteServantDialogData(undefined);
    }, []);

    const openEditServantDialog = useCallback((): void => {
        const { selectedItems: selectedServants } = selectedServantData;
        if (!selectedServants.length) {
            return;
        }

        const {
            bondLevels,
            costumes
        } = masterAccountEditData;

        const editServantDialogData = MasterServantUpdateUtils.convertToUpdateObject(selectedServants, bondLevels, costumes);
        setEditServantDialogData(editServantDialogData);
        setIsMultiAddServantDialogOpen(false);
        setDeleteServantDialogData(undefined);
    }, [masterAccountEditData, selectedServantData]);

    const openDeleteServantDialog = useCallback((): void => {
        if (!gameServantMap) {
            return;
        }
        const { selectedItems: selectedServants } = selectedServantData;
        if (!selectedServants.length) {
            return;
        }
        // TODO Un-hardcode static strings.
        const prompt = <>
            <p>The following servant{selectedServants.length > 1 && 's'} will be deleted:</p>
            <ul>
                {selectedServants.map(({ gameId }) => {
                    const { name, metadata } = gameServantMap[gameId];
                    return <li>{metadata?.displayName || name || gameId}</li>;
                })}
            </ul>
            <p>Are you sure you want to proceed?</p>
        </>;
        setDeleteServantDialogData(prompt);
        setIsMultiAddServantDialogOpen(false);
        setEditServantDialogData(undefined);
    }, [gameServantMap, selectedServantData]);


    //#endregion


    //#region Navigation rail event handlers

    const handleMultiAddServant = openMultiAddServantDialog;

    const handleDragDropActivate = useCallback(() => {
        /*
         * Deselect servants...servant selection is not allowed in drag-drop mode.
         */
        deselectServants();
        startDragDrop(masterAccountEditData.servants);
    }, [deselectServants, masterAccountEditData, startDragDrop]);

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


    //#region Context menu event handlers

    const handleSelectAllServants = useCallback(() => {
        selectAllServants();
    }, [selectAllServants]);

    const handleDeselectAllServants = useCallback(() => {
        deselectServants();
    }, [deselectServants]);

    //#endregion


    //#region Common event handlers

    const handleAddServant = openAddServantDialog;

    const handleEditSelectedServants = openEditServantDialog;

    const handleDeleteSelectedServants = openDeleteServantDialog;

    //#endregion


    //#region Other event handlers

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        setEditServantDialogData(undefined);
        setDeleteServantDialogData(undefined);
        setAwaitingRequest(true);
        try {
            await persistChanges();
            setAwaitingRequest(false);
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            setAwaitingRequest(false);
            revertChanges();
        }
    }, [persistChanges, revertChanges]);

    const handleRevertButtonClick = revertChanges;

    const handleMultiAddServantDialogClose = useCallback((event: any, reason: any, data?: MultiAddServantData): void => {
        if (data && data.gameIds.length) {
            const servantData = MasterServantUpdateUtils.instantiateForNewServant();
            servantData.summoned = data.summoned;
            addServants(data.gameIds, servantData);
        }
        setIsMultiAddServantDialogOpen(false);
    }, [addServants]);

    const handleEditServantDialogClose = useCallback((event: any, reason: any, data?: MasterServantUpdate): void => {
        setEditServantDialogData(undefined);
        /*
         * Close the dialog without taking any further action if the changes were
         * cancelled (if `data` is undefined, then the changes were cancelled).
         */
        if (!data) {
            return;
        }
        if (data.isNewServant) {
            addServant(data);
        } else {
            applyUpdateToSelectedServants(data);
        }
    }, [addServant, applyUpdateToSelectedServants]);

    const handleDeleteServantDialogClose = useCallback((event: MouseEvent, reason: ModalOnCloseReason): any => {
        if (reason === 'submit') {
            deleteSelectedServants();
        }
        setDeleteServantDialogData(undefined);
    }, [deleteSelectedServants]);

    //#endregion


    //#region Component rendering

    /*
     * This can be undefined during the initial render.
     */
    if (!gameServantMap) {
        return null;
    }

    const {
        selectedIds: selectedInstanceIds,
        selectedCount: selectedServantsCount
    } = selectedServantData;

    const isMultipleServantsSelected = selectedServantsCount > 1;

    const {
        servants: masterServants,
        bondLevels,
        costumes
    } = masterAccountEditData;

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <RouteDataEditControls
                title='Servant Roster'
                hasUnsavedData={isDataDirty}
                onRevertButtonClick={handleRevertButtonClick}
                onSaveButtonClick={handleSaveButtonClick}
                disabled={awaitingRequest}
            />
            <MasterServantsFilterControls
                filtersEnabled={filtersEnabled}
            // showUnsummonedServants={showUnsummonedServants}
            // onToggleShowUnsummonedServants={toggleShowUnsummonedServants}
            />
            <div className={`${StyleClassPrefix}-lower-layout-container`}>
                <MasterServantsNavigationRail
                    layout={sm ? 'column' : 'row'}
                    dragDropMode={dragDropMode}
                    filtersEnabled={filtersEnabled}
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
                />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                        <MasterServantList
                            masterServants={masterServants}
                            bondLevels={bondLevels}
                            selectedServants={selectedInstanceIds}
                            showHeader={sm}
                            visibleColumns={visibleColumns}
                            // onHeaderClick={}
                            onServantClick={handleServantClick}
                            onEditSelectedServants={handleEditSelectedServants}
                            dragDropMode={dragDropMode}
                            dragDropMasterServants={dragDropData}
                            onDragOrderChange={handleDragOrderChange}
                        />
                    </div>
                    <div className={`${StyleClassPrefix}-info-panel-container`}>
                        <MasterServantsInfoPanel
                            /**
                             * TODO Change this to false for mobile view, also make it user configurable.
                             */
                            keepChildrenMounted
                            /**
                             * TODO If closed and not kept mounted, then don't load the selectedItems since
                             * it is lazy loaded.
                             */
                            activeServants={selectedServantData.selectedItems}
                            bondLevels={bondLevels}
                            unlockedCostumes={costumes}
                            // editMode={editMode}
                            open={infoPanelOpen && md}
                            onOpenToggle={toggleInfoPanelOpen}
                        />
                    </div>
                </div>
            </div>
            <MasterServantsEditDialog
                bondLevels={bondLevels}
                masterServantUpdate={editServantDialogData}
                isMultipleServantsSelected={isMultipleServantsSelected}
                showAppendSkills={showAppendSkills}
                onClose={handleEditServantDialogClose}
            />
            <MasterServantsMultiAddDialog
                open={isMultiAddServantDialogOpen}
                masterServants={masterServants}
                onClose={handleMultiAddServantDialogClose}
            />
            <PromptDialog
                open={!!deleteServantDialogData}
                title={`Delete ${isMultipleServantsSelected ? 'Servants' : 'Servant'}?`}
                prompt={deleteServantDialogData}
                cancelButtonColor='secondary'
                confirmButtonColor='primary'
                confirmButtonLabel='Delete'
                onClose={handleDeleteServantDialogClose}
            />
            <MasterServantsListRowContextMenu
                open={activeContextMenu === 'row'}
                position={contextMenuPosition}
                selectedServantsCount={selectedServantsCount}
                onAddServant={handleAddServant}
                onDeleteSelectedServants={handleDeleteSelectedServants}
                onEditSelectedServants={handleEditSelectedServants}
                onSelectAllServants={handleSelectAllServants}
                onDeselectAllServants={handleDeselectAllServants}
                onClose={closeContextMenu}
            />
        </Box>
    );

    //#endregion

});
