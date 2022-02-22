import { MasterAccount, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Clear as ClearIcon, Save as SaveIcon } from '@mui/icons-material';
import { Fab, FormControlLabel, FormGroup, Switch, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import lodash from 'lodash';
import React, { ChangeEvent, MouseEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PromptDialog } from '../../../../components/dialog/prompt-dialog.component';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPanelContainer } from '../../../../components/layout/layout-panel-container.component';
import { LayoutPanelScrollable } from '../../../../components/layout/layout-panel-scrollable.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { Immutable, ModalOnCloseReason, Nullable } from '../../../../types/internal';
import { MasterServantUtils } from '../../../../utils/master/master-servant.utils';
import { SetUtils } from '../../../../utils/set.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../../../utils/subscription/subscription-topic';
import { MasterServantEditData } from '../../components/master/servant/edit/master-servant-edit-data.type';
import { MasterServantEditDialog } from '../../components/master/servant/edit/master-servant-edit-dialog.component';
import { MasterServantEditUtils } from '../../components/master/servant/edit/master-servant-edit.utils';
import { MasterServantListVisibleColumns } from '../../components/master/servant/list/master-servant-list-columns';
import { MasterServantListHeader } from '../../components/master/servant/list/master-servant-list-header.component';
import { MasterServantList } from '../../components/master/servant/list/master-servant-list.component';
import { MasterServantsInfoPanel } from './master-servants-info-panel.component';
import { MasterServantsNavigationRail } from './master-servants-navigation-rail.component';

type ServantSelection = {
    instanceIds: Set<number>;
    servants: Array<MasterServant>;
};

type MasterAccountData = {
    masterServants: Array<MasterServant>;
    bondLevels: Record<number, MasterServantBondLevel>;
    unlockedCostumes: Array<number>;
};

const getDefaultServantSelection = (): ServantSelection => ({
    instanceIds: new Set(),
    servants: []
});

const getDefaultMasterAccountData = (): MasterAccountData => ({
    masterServants: [],
    bondLevels: {},
    unlockedCostumes: []
});

const cloneMasterAccountData = (account: Nullable<Immutable<MasterAccount>>): MasterAccountData => {
    if (!account) {
        return getDefaultMasterAccountData();
    }
    return {
        masterServants: account.servants.map(MasterServantUtils.clone),
        bondLevels: lodash.cloneDeep(account.bondLevels),
        unlockedCostumes: [...account.costumes]
    };
};

const StyleClassPrefix = 'MasterServants';

const StyleProps = (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    [`& .${StyleClassPrefix}-switch-container`]: {
        px: 4,
        mb: -6
    },
    [`& .${StyleClassPrefix}-main-content`]: {
        display: 'flex',
        flex: '1',
        width: 'calc(100% - 48px)'
    },
    [`& .${StyleClassPrefix}-info-panel-container`]: {
        width: 320,
        height: 'calc(100% - 84px)',
        pr: 4,
        py: 4,
        boxSizing: 'border-box',
        [theme.breakpoints.down('xl')]: {
            width: 300
        }
    }
} as SystemStyleObject<Theme>);

export const MasterServantsRoute = React.memo(() => {

    const forceUpdate = useForceUpdate();

    const [invokeLoadingIndicator, resetLoadingIndicator, isLoadingIndicatorActive] = useLoadingIndicator();

    const masterAccountService = useInjectable(MasterAccountService);

    const gameServantMap = useGameServantMap();

    /**
     * The master account data loaded from the backend. This should not be modified
     * or used anywhere in this route, except when reverting changes. Use
     * `masterAccountDataRef` instead.
     */
    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();
    /**
     * Contains the `servants`, `bondLevels`, and `unlockedCostumes` data from the
     * `MasterAccount` object.
     *
     * The data is cloned to avoid unwanted modification of the original data. In
     * addition, the data is stored as a ref to prevent unwanted triggering of hooks
     * on change.
     */
    const masterAccountDataRef = useRef<MasterAccountData>(getDefaultMasterAccountData());
    /**
     * Whether the user has made any unsaved changes to the master servant data.
     */
    const [isMasterAccountDirty, setIsMasterAccountDirty] = useState<boolean>(false);

    /**
     * Contains a copy of the target servants' data that is passed directly into and
     * modified by the dialog. The original data is not modified until the changes
     * are submitted.
     *
     * The `open` state of the servant edit dialog is also determined by whether
     * this data is present (dialog is opened if data is defined, and closed if data
     * is undefined).
     */
    const [editServantDialogData, setEditServantDialogData] = useState<MasterServantEditData>();

    /**
     * Contains the message prompt that is displayed by the delete servant dialog.
     *
     * The `open` state of the delete servant dialog is also determined by whether
     * this data is present (dialog is opened if data is defined, and closed if data
     * is undefined).
     */
    const [deleteServantDialogData, setDeleteServantDialogData] = useState<ReactNode>();

    /**
     * Shallow clone of the `masterServants` array from `masterAccountDataRef` for
     * use with drag-drop mode.
     * 
     * This will be `undefined` when not in drag-drop mode.
     */
    const [dragDropMasterServants, setDragDropMasterServants] = useState<Array<MasterServant>>();

    const dragDropMode = !!dragDropMasterServants;

    const [showAppendSkills, setShowAppendSkills] = useState<boolean>(false);

    const { sm, md, lg, xl } = useActiveBreakpoints();

    const visibleColumns = useMemo((): MasterServantListVisibleColumns => ({
        npLevel: lg,
        level: sm,
        bondLevel: xl,
        fouHp: lg,
        fouAtk: lg,
        skills: sm,
        appendSkills: sm && showAppendSkills,
        actions: false
    }), [showAppendSkills, sm, lg, xl]);

    /**
     * The selected servants.
     */
    const selectedServantsRef = useRef<ServantSelection>({
        instanceIds: new Set(),
        servants: []
    });

    /**
     * If the `masterServants` reference changes (due to data being reloaded, etc.)
     * the some of the currently selected instance IDs may no longer be present. In
     * addition, the servant object references themselves could have changed.
     *
     * This function validates and updates the `selectedServantsRef` data against
     * the updated `masterServants` data.
     */
    const updateSelectedServantsRef = useCallback((): void => {
        const currentSelectionIds = selectedServantsRef.current.instanceIds;
        if (!currentSelectionIds.size || !masterAccountDataRef.current) {
            return;
        }
        const updatedMasterServants = masterAccountDataRef.current.masterServants;
        const updatedSelection = updatedMasterServants.filter(servant => currentSelectionIds.has(servant.instanceId));
        const updatedSelectionIds = new Set(updatedSelection.map(servant => servant.instanceId));
        selectedServantsRef.current = {
            instanceIds: updatedSelectionIds,
            servants: updatedSelection
        };
    }, []);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopic.User_CurrentMasterAccountChange)
            .subscribe(account => {
                masterAccountDataRef.current = cloneMasterAccountData(account);
                const isSameAccount = masterAccount?._id === account?._id;
                if (isSameAccount) {
                    updateSelectedServantsRef();
                } else {
                    selectedServantsRef.current = getDefaultServantSelection();
                }
                setMasterAccount(account);
                setIsMasterAccountDirty(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [masterAccount?._id, updateSelectedServantsRef]);


    //#region Internal helper functions

    /**
     * Sends master servant update request to the back-end.
     */
    const updateMasterAccount = useCallback(async (): Promise<void> => {
        if (!masterAccount) {
            return;
        }
        invokeLoadingIndicator();

        setEditServantDialogData(undefined);
        setDeleteServantDialogData(undefined);

        const {
            masterServants,
            bondLevels,
            unlockedCostumes
        } = masterAccountDataRef.current;

        const update: Partial<MasterAccount> = {
            _id: masterAccount._id,
            servants: masterServants,
            bondLevels,
            costumes: unlockedCostumes
        };
        try {
            await masterAccountService.updateAccount(update);
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            masterAccountDataRef.current = cloneMasterAccountData(masterAccount);
            updateSelectedServantsRef();
            setIsMasterAccountDirty(false);
        }

        resetLoadingIndicator();

    }, [invokeLoadingIndicator, masterAccount, masterAccountService, resetLoadingIndicator, updateSelectedServantsRef]);

    const setServantSelection = useCallback((instanceIds: Array<number>): void => {
        /*
         * Servant selection is not allowed in drag-drop mode.
         */
        if (dragDropMode) {
            return;
        }
        const updatedSelectionIds = new Set(instanceIds);
        if (SetUtils.isEqual(updatedSelectionIds, selectedServantsRef.current.instanceIds)) {
            return;
        }
        const { masterServants } = masterAccountDataRef.current;
        selectedServantsRef.current = {
            instanceIds: updatedSelectionIds,
            servants: masterServants.filter(servant => updatedSelectionIds.has(servant.instanceId))
        };
        forceUpdate();
    }, [dragDropMode, forceUpdate]);

    const addNewServant = useCallback((data: MasterServantEditData) => {

        const {
            masterServants,
            bondLevels,
            // unlockedCostumes
        } = masterAccountDataRef.current;

        /**
         * Computed instance ID for the new servant.
         */
        const instanceId = MasterServantUtils.getLastInstanceId(masterServants) + 1;
        /**
         * New instance of a `MasterServant` object. This will be populated with the
         * data returned by the dialog.
         */
        const masterServant = MasterServantUtils.instantiate(instanceId);
        MasterServantEditUtils.applyFromEditData(data, masterServant, bondLevels);
        /*
         * Rebuild the entire array with the new servant included to force the child
         * list to re-render.
         */
        masterAccountDataRef.current.masterServants = [...masterServants, masterServant];
        /*
         * TODO Also update the unlocked costumes.
         */
        setIsMasterAccountDirty(true);
    }, []);

    /**
     * Applies the submitted edit to the currently selected servants.
     */
    const applyEditToSelectedServants = useCallback((data: MasterServantEditData) => {

        const {
            masterServants,
            bondLevels,
            // unlockedCostumes
        } = masterAccountDataRef.current;

        /*
         * Apply the change data for all of the selected servants.
         */
        const { servants: selectedServants } = selectedServantsRef.current;
        MasterServantEditUtils.applyFromEditData(data, selectedServants, bondLevels);
        /*
         * FIXME This n^2 operation might get slow as we have more servants.
         */
        for (const selectedServant of selectedServants) {
            /*
             * The master servants in the `selectedServantsRef` should have the same object
             * references as the ones in the `masterAccountDataRef`, so we can search
             * directly by reference.
             */
            const index = masterServants.indexOf(selectedServant);
            if (index !== -1) {
                /*
                 * Re-build the servant object to force its row to re-render.
                 */
                masterServants[index] = { ...selectedServant };
            }
        }
        /*
         * Rebuild the entire array to force the child list to re-render.
         */
        masterAccountDataRef.current.masterServants = [...masterServants];
        /*
         * TODO Also update the unlocked costumes.
         */
        updateSelectedServantsRef();
        setIsMasterAccountDirty(true);
    }, [updateSelectedServantsRef]);

    /**
     * Deletes the currently selected servants.
     */
    const deleteSelectedServants = useCallback((): void => {
        const { servants: selectedServants } = selectedServantsRef.current;
        if (!selectedServants.length) {
            return;
        }
        let { masterServants } = masterAccountDataRef.current;
        /*
         * The master servants in the `selectedServantsRef` should have the same object
         * references as the ones in the `masterAccountDataRef`, so we can search
         * directly by reference.
         * 
         * This will also rebuild the entire array to force the child list to re-render.
         * 
         * FIXME This n^2 operation might get slow as we have more servants.
         */
        masterServants = masterServants.filter(servant => !selectedServants.includes(servant));
        masterAccountDataRef.current.masterServants = masterServants;
        /*
         * TODO Also remove bond/costume data if the last instance of the servant is
         * removed.
         */
        selectedServantsRef.current = getDefaultServantSelection();
        setDeleteServantDialogData(undefined);
        setIsMasterAccountDirty(true);
    }, []);

    const openEditServantDialog = useCallback((): void => {
        const { servants: selectedServants } = selectedServantsRef.current;
        if (!selectedServants.length) {
            return;
        }

        const {
            bondLevels,
            unlockedCostumes
        } = masterAccountDataRef.current;

        const editServantDialogData = MasterServantEditUtils.convertToEditData(selectedServants, bondLevels, unlockedCostumes);
        setEditServantDialogData(editServantDialogData);
        setDeleteServantDialogData(undefined);
    }, []);

    const openDeleteServantDialog = useCallback((): void => {
        if (!gameServantMap) {
            return;
        }
        const { servants: selectedServants } = selectedServantsRef.current;
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
        setEditServantDialogData(undefined);
    }, [gameServantMap]);


    //#endregion


    //#endregion Nav rail event handlers

    const handleAddServant = useCallback((): void => {
        const {
            bondLevels,
            unlockedCostumes
        } = masterAccountDataRef.current;

        const editServantDialogData = MasterServantEditUtils.instantiateForNewServant(bondLevels, unlockedCostumes);
        setEditServantDialogData(editServantDialogData);
        setDeleteServantDialogData(undefined);
    }, []);

    const handleDragDropActivate = useCallback(() => {
        /*
         * Deselect servants...servant selection is not allowed in drag-drop mode.
         */
        selectedServantsRef.current = getDefaultServantSelection();
        setDragDropMasterServants([...masterAccountDataRef.current.masterServants]);
    }, []);

    const handleDragDropApply = useCallback(() => {
        if (!dragDropMasterServants) {
            return;
        }
        masterAccountDataRef.current.masterServants = dragDropMasterServants;
        setDragDropMasterServants(undefined);
        // TODO Check if order actually changed before setting dirty.
        setIsMasterAccountDirty(true);
    }, [dragDropMasterServants]);

    const handleDragDropCancel = useCallback(() => {
        setDragDropMasterServants(undefined);
    }, []);

    //#endregion


    //#region Servant list event handlers

    const handleEditServant = useCallback(({ instanceId }: MasterServant) => {
        if (dragDropMode) {
            return;
        }
        /*
         * Select the target servant. This is needed because the servant edit dialog
         * will target whichever servant are currently selected on submit.
         */
        setServantSelection([instanceId]);
        openEditServantDialog();
    }, [dragDropMode, openEditServantDialog, setServantSelection]);

    const handleDeleteServant = useCallback(({ instanceId }: MasterServant): void => {
        if (dragDropMode) {
            return;
        }
        /*
         * Select the target servant. This is needed because the delete servant dialog
         * will target whichever servant are currently selected on submit.
         */
        setServantSelection([instanceId]);
        openDeleteServantDialog();
    }, [dragDropMode, openDeleteServantDialog, setServantSelection]);

    //#endregion


    //#region Common event handlers

    const handleEditSelectedServants = openEditServantDialog;

    const handleDeleteSelectedServants = openDeleteServantDialog;

    //#endregion


    //#region Other event handlers

    const handleShowAppendSkillsChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        setShowAppendSkills(event.target.checked);
    }, []);

    const handleFormChange = useCallback((): void => {
        const masterAccountData = masterAccountDataRef.current;
        masterAccountData.masterServants = [...masterAccountData.masterServants]; // Forces child list to re-render
        forceUpdate();
    }, [forceUpdate]);

    const handleSaveButtonClick = useCallback((): void => {
        updateMasterAccount();
    }, [updateMasterAccount]);

    const handleRevertButtonClick = useCallback((): void => {
        // Copy data back from master account
        masterAccountDataRef.current = cloneMasterAccountData(masterAccount);
        updateSelectedServantsRef();
        setIsMasterAccountDirty(false);
    }, [masterAccount, updateSelectedServantsRef]);

    const handleEditServantDialogClose = useCallback((event: any, reason: any, data?: MasterServantEditData): void => {
        setEditServantDialogData(undefined);
        /*
         * Close the dialog without taking any further action if the changes were
         * cancelled (if `data` is undefined, then the changes were cancelled).
         */
        if (!data) {
            return;
        }
        if (data.isNewServant) {
            addNewServant(data);
        } else {
            applyEditToSelectedServants(data);
        }
    }, [addNewServant, applyEditToSelectedServants]);

    const handleDeleteServantDialogClose = useCallback((event: MouseEvent, reason: ModalOnCloseReason): any => {
        if (reason !== 'submit') {
            return setDeleteServantDialogData(undefined);
        }
        deleteSelectedServants();
    }, [deleteSelectedServants]);

    //#endregion

    /*
     * This can be undefined during the initial render.
     */
    if (!gameServantMap) {
        return null;
    }

    const {
        instanceIds: selectedInstanceIds,
        servants: selectedServants
    } = selectedServantsRef.current;

    const isMultipleServantsSelected = selectedServants.length > 1;

    /**
     * FabContainer children
     */
    let fabContainerChildNodes: ReactNode = null;
    if (!dragDropMode) {
        fabContainerChildNodes = [
            <Tooltip key='cancel' title='Cancel'>
                <div>
                    <Fab
                        color='default'
                        onClick={handleRevertButtonClick}
                        disabled={!isMasterAccountDirty || isLoadingIndicatorActive}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key='save' title='Save changes'>
                <div>
                    <Fab
                        color='primary'
                        onClick={handleSaveButtonClick}
                        disabled={!isMasterAccountDirty || isLoadingIndicatorActive}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    };

    const {
        masterServants,
        bondLevels,
        unlockedCostumes
    } = masterAccountDataRef.current;

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className='flex justify-space-between align-center'>
                <PageTitle>Servant Roster</PageTitle>
                <div className={`${StyleClassPrefix}-switch-container`}>
                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Switch
                                    name='showAppendSkills'
                                    checked={showAppendSkills}
                                    onChange={handleShowAppendSkillsChange}
                                />
                            }
                            label='Append Skills'
                        />
                    </FormGroup>
                </div>
            </div>
            <div className='flex overflow-hidden full-height'>
                <MasterServantsNavigationRail
                    selectedServantsCount={selectedServants.length}
                    dragDropMode={dragDropMode}
                    onAddServant={handleAddServant}
                    onDeleteSelectedServants={handleDeleteSelectedServants}
                    onDragDropActivate={handleDragDropActivate}
                    onDragDropApply={handleDragDropApply}
                    onDragDropCancel={handleDragDropCancel}
                    onEditSelectedServants={handleEditSelectedServants}
                />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <LayoutPanelScrollable
                        className='py-4 pr-4 full-height flex-fill scrollbar-track-border'
                        autoHeight
                        headerContents={
                            <MasterServantListHeader
                                // editMode={editMode}
                                visibleColumns={visibleColumns}
                            />
                        }
                        children={
                            <MasterServantList
                                masterServants={dragDropMasterServants || masterServants}
                                bondLevels={bondLevels}
                                selectedServants={selectedInstanceIds}
                                // showAddServantRow
                                visibleColumns={visibleColumns}
                                dragDropMode={dragDropMode}
                                onServantSelectionChange={setServantSelection}
                                onEditSelectedServants={handleEditSelectedServants}
                                onEditServant={handleEditServant}
                                onDeleteServant={handleDeleteServant}
                            />
                        }
                    />
                    {md && <div className={`${StyleClassPrefix}-info-panel-container`}>
                        <LayoutPanelContainer className='flex column full-height' autoHeight>
                            <MasterServantsInfoPanel
                                activeServants={selectedServants}
                                bondLevels={bondLevels}
                                unlockedCostumes={unlockedCostumes}
                                showAppendSkills={showAppendSkills}
                                // editMode={editMode}
                                onStatsChange={handleFormChange}
                            />
                        </LayoutPanelContainer>
                    </div>}
                </div>
            </div>
            <FabContainer children={fabContainerChildNodes} />
            <MasterServantEditDialog
                submitButtonLabel='Done'
                editData={editServantDialogData}
                multiEditMode={isMultipleServantsSelected}
                showAppendSkills={showAppendSkills}
                onClose={handleEditServantDialogClose}
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
        </Box>
    );
});
