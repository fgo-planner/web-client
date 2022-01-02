import { MasterAccount, MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { AccessibilityNew as AccessibilityNewIcon, Add as AddIcon, Clear as ClearIcon, Edit as EditIcon, Equalizer as EqualizerIcon, GetApp, Publish as PublishIcon, Save as SaveIcon } from '@mui/icons-material';
import { Fab, IconButton, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import lodash from 'lodash';
import React, { MouseEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PromptDialog } from '../../../../components/dialog/prompt-dialog.component';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPanelContainer } from '../../../../components/layout/layout-panel-container.component';
import { LayoutPanelScrollable } from '../../../../components/layout/layout-panel-scrollable.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { LoadingIndicatorOverlayService } from '../../../../services/user-interface/loading-indicator-overlay.service';
import { ModalOnCloseReason, Nullable } from '../../../../types/internal';
import { MasterServantUtils } from '../../../../utils/master/master-servant.utils';
import { SetUtils } from '../../../../utils/set.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../../../utils/subscription/subscription-topic';
import { MasterServantEditDialog } from '../../components/master/servant/edit-dialog/master-servant-edit-dialog.component';
import { MasterServantListVisibleColumns } from '../../components/master/servant/list/master-servant-list-columns';
import { MasterServantListHeader } from '../../components/master/servant/list/master-servant-list-header.component';
import { MasterServantList } from '../../components/master/servant/list/master-servant-list.component';
import { MasterServantInfoPanel } from './master-servant-info-panel.component';

type MasterAccountData = {
    masterServants: Array<MasterServant>;
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    unlockedCostumes: Array<number>;
};

const getMasterAccountData = (account: Nullable<MasterAccount>, clone = false): MasterAccountData => {
    if (!account) {
        return {
            masterServants: [],
            bondLevels: {},
            unlockedCostumes: []
        };
    }
    if (!clone) {
        return {
            masterServants: account.servants,
            bondLevels: account.bondLevels,
            unlockedCostumes: account.costumes
        };
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

    const loadingIndicatorOverlayService = useInjectable(LoadingIndicatorOverlayService);
    const masterAccountService = useInjectable(MasterAccountService);

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editServant, setEditServant] = useState<MasterServant>();
    const [editServantDialogOpen, setEditServantDialogOpen] = useState<boolean>(false);
    const [deleteServant, setDeleteServant] = useState<MasterServant>();
    const [deleteServantDialogOpen, setDeleteServantDialogOpen] = useState<boolean>(false);

    /**
     * Contains the `servants`, `bondLevels`, and `unlockedCostumes` data from the
     * `MasterAccount` object. In edit mode, the data is cloned to prevent the
     * original objects from being modified.
     *
     * These are stored as a ref to prevent unwanted triggering of `useCallback`
     * hooks.
     */
    const masterAccountDataRef = useRef<MasterAccountData>(getMasterAccountData(masterAccount));

    /**
     * The selected servants.
     */
    const selectedServantsRef = useRef<{ instanceIds: Set<number>, servants: Array<MasterServant> }>({
        instanceIds: new Set(),
        servants: []
    });

    const loadingIndicatorIdRef = useRef<string>();

    const gameServantMap = useGameServantMap();

    const { sm, md, lg, xl } = useActiveBreakpoints();

    const visibleColumns = useMemo((): MasterServantListVisibleColumns => ({
        npLevel: lg,
        level: sm,
        bondLevel: xl,
        fouHp: lg,
        fouAtk: lg,
        skillLevels: sm,
        actions: false
    }), [sm, lg, xl]);

    const deleteServantDialogPrompt = useMemo((): string | undefined => {
        if (!gameServantMap || !deleteServant) {
            return undefined;
        }
        const servant = gameServantMap[deleteServant.gameId];
        return `Are you sure you want to remove ${servant?.name} from the servant list?`;
    }, [gameServantMap, deleteServant]);

    const resetLoadingIndicator = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            loadingIndicatorOverlayService.waive(loadingIndicatorId);
            loadingIndicatorIdRef.current = undefined;
            forceUpdate();
        }
    }, [forceUpdate, loadingIndicatorOverlayService]);

    /**
     * If the `masterServants` reference changes (due to data being reloaded, etc.)
     * the some of the currently selected instance IDs may no longer be present. In
     * addition, the servant object references themselves could have changed.
     *
     * This function validates and updates the `selectedServantsRef` data against
     * the updated `masterServants` data.
     */
    const updateSelectedServants = useCallback((): void => {
        const currentSelectionIds = selectedServantsRef.current.instanceIds;
        if (!currentSelectionIds.size) {
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

    /**
     * onCurrentMasterAccountChange subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopic.User_CurrentMasterAccountChange)
            .subscribe(account => {
                masterAccountDataRef.current = getMasterAccountData(account);
                selectedServantsRef.current = {
                    instanceIds: new Set(),
                    servants: []
                };
                setMasterAccount(account);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /**
     * onCurrentMasterAccountUpdate subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountUpdateSubscription = SubscribablesContainer
            .get(SubscriptionTopic.User_CurrentMasterAccountUpdate)
            .subscribe(account => {
                resetLoadingIndicator();
                if (account == null) {
                    return;
                }
                masterAccountDataRef.current = getMasterAccountData(account);
                updateSelectedServants();
                setMasterAccount(account);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountUpdateSubscription.unsubscribe();
    }, [resetLoadingIndicator, updateSelectedServants]);

    const handleUpdateError = useCallback((error: any): void => {
        resetLoadingIndicator();
        // TODO Display error message to user.
        console.error(error);
        masterAccountDataRef.current = getMasterAccountData(masterAccount);
        updateSelectedServants();
        setEditMode(false);
        setEditServant(undefined);
        setEditServantDialogOpen(false);
        setDeleteServant(undefined);
        setDeleteServantDialogOpen(false);
    }, [masterAccount, resetLoadingIndicator, updateSelectedServants]);

    /**
     * Sends master servant update request to the back-end.
     */
    const updateMasterAccount = useCallback((): void => {
        const update: Partial<MasterAccount> = {
            _id: masterAccount?._id,
            ...masterAccountDataRef.current as any
        };
        masterAccountService.updateAccount(update)
            .catch(handleUpdateError);

        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = loadingIndicatorOverlayService.invoke();
        }
        loadingIndicatorIdRef.current = loadingIndicatorId;

        setEditServant(undefined);
        setEditServantDialogOpen(false);
        setDeleteServant(undefined);
        setDeleteServantDialogOpen(false);
    }, [handleUpdateError, loadingIndicatorOverlayService, masterAccount?._id, masterAccountService]);

    const handleFormChange = useCallback((): void => {
        const masterAccountData = masterAccountDataRef.current;
        masterAccountData.masterServants = [...masterAccountData.masterServants]; // Forces child list to re-render
        forceUpdate();
    }, [forceUpdate]);

    const handleEditButtonClick = useCallback((): void => {
        masterAccountDataRef.current = getMasterAccountData(masterAccount, true);
        setEditMode(true);
    }, [masterAccount]);

    const handleCancelButtonClick = useCallback((): void => {
        // Re-clone data from master account
        masterAccountDataRef.current = getMasterAccountData(masterAccount);
        updateSelectedServants();
        setEditMode(false);
    }, [masterAccount, updateSelectedServants]);

    const openEditServantDialog = useCallback((masterServant?: MasterServant): void => {
        if (!editMode) {
            return;
        }
        setEditServant(masterServant);
        setEditServantDialogOpen(true);
        setDeleteServant(undefined);
        setDeleteServantDialogOpen(false);
    }, [editMode]);

    const closeEditServantDialog = useCallback((): void => {
        setEditServant(undefined);
        setEditServantDialogOpen(false);
    }, []);

    const handleAddServantButtonClick = useCallback((): void => {
        openEditServantDialog();
    }, [openEditServantDialog]);

    const handleEditServantDialogClose = useCallback((
        event: any,
        reason: any,
        data?: { masterServant: Omit<MasterServant, 'instanceId'>, bond: MasterServantBondLevel | undefined, costumes: Array<number> }
    ): void => {

        /*
         * Close the dialog without taking any further action if the component is not
         * in edit mode, or if the changes were cancelled (if `data` is undefined, then
         * the changes were cancelled).
         */
        if (!editMode || !data) {
            return closeEditServantDialog();
        }

        const {
            masterServants,
            bondLevels,
            unlockedCostumes
        } = masterAccountDataRef.current;

        const servantId = data.masterServant.gameId;

        /*
         * Update the bond level map.
         * TODO Move this to a separate method/function.
         */
        bondLevels[servantId] = data.bond;

        /*
         * Update the unlocked costumes list.
         * TODO Move this to a separate method/function.
         */
        const servant = gameServantMap!![servantId];
        const costumesIds = Object.keys(servant.costumes).map(Number);
        unlockedCostumes.filter(c => costumesIds.indexOf(c) === -1);
        unlockedCostumes.push(...data.costumes);

        /*
         * If a new servant is being added, then `editServant` will be undefined.
         * Conversely, if an existing servant is being edited, then `editServant`
         * should be defined.
         */
        if (!editServant) {
            /**
             * Computed instance ID for the new servant.
             */
            const instanceId = MasterServantUtils.getLastInstanceId(masterServants) + 1;
            /**
             * New servant object.
             */
            const masterServant: MasterServant = {
                ...data.masterServant,
                instanceId
            };
            /*
             * The master servant array will need to be rebuilt to trigger a re-render
             * after updating the component state.
             */
            masterServants.push(masterServant);

        } else {
            /*
             * Merge changes into existing servant object.
             */
            lodash.assign(editServant, data.masterServant);
            /*
             * Re-build the servant object to force its row to re-render.
             */
            const index = masterServants.indexOf(editServant);
            if (index !== -1) {
                masterServants[index] = { ...editServant };
            }
        }

        masterAccountDataRef.current.masterServants = [...masterServants]; // Forces child list to re-render
        closeEditServantDialog();
    }, [gameServantMap, editMode, editServant, closeEditServantDialog]);

    const openDeleteServantDialog = useCallback((masterServant: MasterServant): void => {
        if (!editMode) {
            return;
        }
        setEditServant(undefined);
        setEditServantDialogOpen(false);
        setDeleteServant(masterServant);
        setDeleteServantDialogOpen(true);
    }, [editMode]);

    const closeDeleteServantDialog = useCallback((): void => {
        setDeleteServant(undefined);
        setDeleteServantDialogOpen(false);
    }, []);

    const handleDeleteServantDialogClose = useCallback((event: MouseEvent, reason: ModalOnCloseReason): void => {
        if (reason !== 'submit') {
            return closeDeleteServantDialog();
        }
        const { masterServants } = masterAccountDataRef.current;
        lodash.remove(masterServants, servant => servant.instanceId === deleteServant?.instanceId);
        // TODO Remove bond/costume data if the last instance of the servant is removed.
        if (!editMode) {
            return updateMasterAccount();
        }
        masterAccountDataRef.current.masterServants = [...masterServants]; // Forces child list to re-render
        closeDeleteServantDialog();
    }, [editMode, deleteServant?.instanceId, closeDeleteServantDialog, updateMasterAccount]);

    const handleServantSelectionChange = useCallback((instanceIds: Array<number>): void => {
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
    }, [forceUpdate]);

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes: ReactNode = useMemo(() => {
        return [
            <Tooltip key="add" title="Add servant" placement="right">
                <div>
                    <IconButton
                        onClick={handleAddServantButtonClick}
                        children={<AddIcon />}
                        disabled={!editMode}
                        size="large" />
                </div>
            </Tooltip>,
            <Tooltip key="costumes" title="Costumes" placement="right">
                <div>
                    <IconButton
                        component={Link}
                        to="costumes"
                        children={<AccessibilityNewIcon />}
                        size="large" />
                </div>
            </Tooltip>,
            <Tooltip key="stats" title="Servant stats" placement="right">
                <div>
                    <IconButton
                        component={Link}
                        to="stats"
                        children={<EqualizerIcon />}
                        size="large" />
                </div>
            </Tooltip>,
            <Tooltip key="import" title="Upload servant data" placement="right">
                <div>
                    <IconButton
                        component={Link}
                        to="../master/data/import/servants"
                        children={<PublishIcon />}
                        size="large" />
                </div>
            </Tooltip>,
            <Tooltip key="export" title="Download servant data" placement="right">
                <div>
                    {/* TODO Implement this */}
                    <IconButton children={<GetApp />} disabled size="large" />
                </div>
            </Tooltip>
        ];
    }, [editMode, handleAddServantButtonClick]);

    /**
     * FabContainer children
     */
    const fabContainerChildNodes: ReactNode = useMemo(() => {
        if (!editMode) {
            return (
                <Tooltip key="edit" title="Batch edit mode">
                    <div>
                        <Fab
                            color="primary"
                            onClick={handleEditButtonClick}
                            disabled={!!loadingIndicatorIdRef.current}
                            children={<EditIcon />}
                        />
                    </div>
                </Tooltip>
            );
        }
        return [
            <Tooltip key="cancel" title="Cancel">
                <div>
                    <Fab
                        color="default"
                        onClick={handleCancelButtonClick}
                        disabled={!!loadingIndicatorIdRef.current}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="save" title="Save changes">
                <div>
                    <Fab
                        color="primary"
                        onClick={updateMasterAccount}
                        disabled={!!loadingIndicatorIdRef.current}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }, [editMode, handleCancelButtonClick, handleEditButtonClick, updateMasterAccount]);

    if (!gameServantMap) {
        return null;
    }

    const {
        masterServants,
        bondLevels,
        unlockedCostumes
    } = masterAccountDataRef.current;

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <PageTitle>
                {editMode ?
                    'Edit Servant Roster' :
                    'Servant Roster'
                }
            </PageTitle>
            <div className="flex overflow-hidden full-height">
                <NavigationRail children={navigationRailChildNodes} />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <LayoutPanelScrollable
                        className="py-4 pr-4 full-height flex-fill scrollbar-track-border"
                        autoHeight
                        headerContents={
                            <MasterServantListHeader
                                editMode={editMode}
                                visibleColumns={visibleColumns}
                            />
                        }
                        children={
                            <MasterServantList
                                masterServants={masterServants}
                                bondLevels={bondLevels}
                                selectedServants={selectedServantsRef.current.instanceIds}
                                editMode={editMode}
                                showAddServantRow={editMode}
                                visibleColumns={visibleColumns}
                                openLinksInNewTab={editMode}
                                onServantSelectionChange={handleServantSelectionChange}
                                onAddServant={handleAddServantButtonClick}
                                onEditServant={openEditServantDialog}
                                onDeleteServant={openDeleteServantDialog}
                            />
                        }
                    />
                    {md && <div className={`${StyleClassPrefix}-info-panel-container`}>
                        <LayoutPanelContainer className="flex column full-height" autoHeight>
                            <MasterServantInfoPanel
                                activeServants={selectedServantsRef.current.servants}
                                bondLevels={bondLevels}
                                unlockedCostumes={unlockedCostumes}
                                editMode={editMode}
                                onStatsChange={handleFormChange}
                            />
                        </LayoutPanelContainer>
                    </div>}
                </div>
            </div>
            <FabContainer children={fabContainerChildNodes} />
            <MasterServantEditDialog
                open={editServantDialogOpen}
                dialogTitle={editServant ? 'Edit Servant Info' : 'Add Servant'}
                submitButtonLabel={editMode ? 'Done' : 'Save'}
                disableServantSelect={!!editServant}
                masterServant={editServant}
                bondLevels={bondLevels}
                unlockedCostumes={unlockedCostumes}
                onClose={handleEditServantDialogClose}
            />
            <PromptDialog
                open={deleteServantDialogOpen}
                title="Delete Servant?"
                prompt={deleteServantDialogPrompt}
                cancelButtonColor="secondary"
                confirmButtonColor="primary"
                confirmButtonLabel="Delete"
                onClose={handleDeleteServantDialogClose}
            />
        </Box>
    );
});
