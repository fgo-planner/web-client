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
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { LoadingIndicatorOverlayService } from '../../../../services/user-interface/loading-indicator-overlay.service';
import { ModalOnCloseReason, Nullable } from '../../../../types/internal';
import { MasterServantUtils } from '../../../../utils/master/master-servant.utils';
import { MasterServantEditDialog } from '../../components/master/servant/edit-dialog/master-servant-edit-dialog.component';
import { MasterServantListVisibleColumns } from '../../components/master/servant/list/master-servant-list-columns';
import { MasterServantListHeader } from '../../components/master/servant/list/master-servant-list-header.component';
import { MasterServantList } from '../../components/master/servant/list/master-servant-list.component';
import { MasterServantInfoPanel } from './master-servant-info-panel.component';

type MasterAccountClonedData = {
    /**
     * Clone of the `servants` array from the MasterAccount object.
     */
    masterServants: MasterServant[];
    /**
     * Clone of the `bondLevels` map from the MasterAccount object.
     */
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    /**
     * Clone of the `costumes` map from the MasterAccount object.
     */
    unlockedCostumes: Array<number>;
};

const cloneFromMasterAccount = (account: Nullable<MasterAccount>): MasterAccountClonedData => {
    if (!account) {
        return {
            masterServants: [],
            bondLevels: {},
            unlockedCostumes: []
        };
    }
    return {
        masterServants: account.servants.map(MasterServantUtils.clone),
        bondLevels: lodash.cloneDeep(account.bondLevels),
        unlockedCostumes: [...account.costumes]
    };
};

const findByGameIdAndInstanceId = (
    masterServants: Array<MasterServant>,
    gameId: number,
    instanceId: number
): MasterServant | undefined => {

    for (const masterServant of masterServants) {
        if (masterServant.instanceId === instanceId) {
            if (masterServant.gameId === gameId) {
                return masterServant;
            }
            break;
        }
    }
};

const StyleClassPrefix = 'MasterServants';

const StyleProps = (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
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

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    /**
     * Clone of the `servants` array from the `MasterAccount` object.
     */
    const [masterServants, setMasterServants] = useState<Array<MasterServant>>([]);
    /**
     * Clone of the `bondLevels` map from the `MasterAccount` object.
     */
    const [bondLevels, setBondLevels] = useState<Record<number, MasterServantBondLevel | undefined>>({});
    /**
     * Clone of the `costumes` map from the `MasterAccount` object.
     */
    const [unlockedCostumes, setUnlockedCostumes] = useState<Array<number>>([]);
    // TODO Do we really need to clone the structures above?
    const [lastInstanceId, setLastInstanceId] = useState<number>(-1);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editServant, setEditServant] = useState<MasterServant>();
    const [editServantDialogOpen, setEditServantDialogOpen] = useState<boolean>(false);
    const [deleteServant, setDeleteServant] = useState<MasterServant>();
    const [deleteServantDialogOpen, setDeleteServantDialogOpen] = useState<boolean>(false);

    const activeServantRef = useRef<MasterServant>();
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
            LoadingIndicatorOverlayService.waive(loadingIndicatorId);
            loadingIndicatorIdRef.current = undefined;
            forceUpdate();
        }
    }, [forceUpdate]);

    /**
     * If the `masterServants` reference changes (due to data being reloaded, etc.)
     * and there is an `activeServant`, then update the `activeServant` reference
     * with the copy from the new `masterServants` reference.
     */
    const updateActiveServantRef = useCallback((masterServants: Array<MasterServant>) => {
        const activeServant = activeServantRef.current;
        if (!activeServant) {
            return;
        }
        const { gameId, instanceId } = activeServant;
        const masterServant = findByGameIdAndInstanceId(masterServants, gameId, instanceId);
        // If it is the same reference, then no need to update.
        if (masterServant === activeServant) {
            return;
        }
        activeServantRef.current = masterServant;
    }, [activeServantRef]);

    /**
     * onCurrentMasterAccountChange subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(account => {
                const { masterServants, bondLevels, unlockedCostumes } = cloneFromMasterAccount(account);
                const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
                updateActiveServantRef(masterServants);
                setMasterAccount(account);
                setMasterServants(masterServants);
                setBondLevels(bondLevels);
                setUnlockedCostumes(unlockedCostumes);
                setLastInstanceId(lastInstanceId);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [updateActiveServantRef]);

    /**
     * onCurrentMasterAccountUpdated subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountUpdatedSubscription = MasterAccountService.onCurrentMasterAccountUpdated
            .subscribe(account => {
                if (account == null) {
                    return;
                }
                const { masterServants, bondLevels, unlockedCostumes } = cloneFromMasterAccount(account);
                const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
                updateActiveServantRef(masterServants);
                resetLoadingIndicator();
                setMasterAccount(account);
                setMasterServants(masterServants);
                setBondLevels(bondLevels);
                setUnlockedCostumes(unlockedCostumes);
                setLastInstanceId(lastInstanceId);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountUpdatedSubscription.unsubscribe();
    }, [resetLoadingIndicator, updateActiveServantRef]);

    const handleUpdateError = useCallback((error: any): void => {
        // TODO Display error message to user.
        console.error(error);
        const { masterServants, bondLevels, unlockedCostumes } = cloneFromMasterAccount(masterAccount);
        const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
        resetLoadingIndicator();
        updateActiveServantRef(masterServants);
        setMasterServants(masterServants);
        setBondLevels(bondLevels);
        setUnlockedCostumes(unlockedCostumes);
        setLastInstanceId(lastInstanceId);
        setEditMode(false);
        setEditServant(undefined);
        setEditServantDialogOpen(false);
        setDeleteServant(undefined);
        setDeleteServantDialogOpen(false);
    }, [masterAccount, resetLoadingIndicator, updateActiveServantRef]);

    /**
     * Sends master servant update request to the back-end.
     */
    const updateMasterAccount = useCallback((
        masterServants: MasterServant[],
        bondLevels: Record<number, MasterServantBondLevel | undefined>,
        unlockedCostumes: number[]
    ): void => {
        const update: Partial<MasterAccount> = {
            _id: masterAccount?._id,
            servants: masterServants,
            bondLevels: bondLevels as Record<number, MasterServantBondLevel>,
            costumes: unlockedCostumes
        };
        MasterAccountService.updateAccount(update)
            .catch(handleUpdateError);

        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = LoadingIndicatorOverlayService.invoke();
        }
        loadingIndicatorIdRef.current = loadingIndicatorId;

        setEditServant(undefined);
        setEditServantDialogOpen(false);
        setDeleteServant(undefined);
        setDeleteServantDialogOpen(false);
    }, [masterAccount?._id, handleUpdateError]);

    const handleFormChange = useCallback((): void => {
        const activeServant = activeServantRef.current;
        if (!activeServant) {
            return;
        }
        setMasterServants([...masterServants]); // Hacky way to force list to re-render
    }, [activeServantRef, masterServants]);

    const handleEditButtonClick = useCallback((): void => {
        setEditMode(true);
    }, []);

    const handleSaveButtonClick = useCallback((): void => {
        updateMasterAccount(masterServants, bondLevels, unlockedCostumes);
    }, [masterServants, bondLevels, unlockedCostumes, updateMasterAccount]);

    const handleCancelButtonClick = useCallback((): void => {
        // Re-clone data from master account
        const { masterServants, bondLevels, unlockedCostumes } = cloneFromMasterAccount(masterAccount);
        updateActiveServantRef(masterServants);
        setMasterServants(masterServants);
        setBondLevels(bondLevels);
        setUnlockedCostumes(unlockedCostumes);
        setEditMode(false);
    }, [masterAccount, updateActiveServantRef]);

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

        let _lastInstanceId = lastInstanceId;
        let _masterServants = masterServants;

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
            /*
             * Build new servant object.
             */
            const masterServant: MasterServant = {
                ...data.masterServant,
                instanceId: ++_lastInstanceId
            };
            /*
             * The master servant array will need to be rebuilt to trigger a re-render
             * after updating the component state.
             */
            _masterServants = [
                ..._masterServants,
                masterServant
            ];

        } else {
            /*
             * Merge changes into existing servant object.
             */
            lodash.assign(editServant, data.masterServant);
            /*
             * Just like the previous case, in edit mode, the master servant will need to
             * be rebuilt to trigger a re-render after updating the component state. The
             * updated servant will also have to be rebuilt to trigger re-render of some
             * children components.
             */
            _masterServants = masterServants.map(servant => {
                return servant === editServant ? { ...editServant } : servant;
            });
        }

        updateActiveServantRef(_masterServants);
        setMasterServants(_masterServants);
        setBondLevels(bondLevels); // This should not be needed
        setLastInstanceId(_lastInstanceId);
        closeEditServantDialog();
    }, [
        gameServantMap,
        masterServants,
        bondLevels,
        unlockedCostumes,
        editMode,
        editServant,
        lastInstanceId,
        updateActiveServantRef,
        closeEditServantDialog
    ]);

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
        lodash.remove(masterServants, servant => servant.instanceId === deleteServant?.instanceId);
        // TODO Remove bond/costume data if the last instance of the servant is removed.
        if (!editMode) {
            return updateMasterAccount(masterServants, bondLevels, unlockedCostumes);
        }
        setMasterServants([...masterServants]); // FIXME Hacky way to force child to re-render
        closeDeleteServantDialog();
    }, [
        masterServants,
        bondLevels,
        unlockedCostumes,
        editMode,
        deleteServant?.instanceId,
        closeDeleteServantDialog,
        updateMasterAccount
    ]);

    const handleActiveServantChange = useCallback((activeServant: MasterServant): void => {
        activeServantRef.current = activeServant;
        forceUpdate();
    }, [activeServantRef, forceUpdate]);

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
                        to="servants/costumes"
                        children={<AccessibilityNewIcon />}
                        size="large" />
                </div>
            </Tooltip>,
            <Tooltip key="stats" title="Servant stats" placement="right">
                <div>
                    <IconButton
                        component={Link}
                        to="servants/stats"
                        children={<EqualizerIcon />}
                        size="large" />
                </div>
            </Tooltip>,
            <Tooltip key="import" title="Upload servant data" placement="right">
                <div>
                    <IconButton
                        component={Link}
                        to="./data/import/servants"
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
                        onClick={handleSaveButtonClick}
                        disabled={!!loadingIndicatorIdRef.current}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }, [editMode, handleCancelButtonClick, handleEditButtonClick, handleSaveButtonClick]);
    
    if (!gameServantMap) {
        return null;
    }

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <PageTitle>
                {editMode ?
                    'Edit Servant Roster' :
                    'Servant Roster'
                }
            </PageTitle>
            <div className="flex overflow-hidden">
                <NavigationRail children={navigationRailChildNodes} />
                <div className="flex flex-fill">
                    <LayoutPanelScrollable
                        className="py-4 pr-4 full-height flex-fill scrollbar-track-border"
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
                                activeServant={activeServantRef.current}
                                editMode={editMode}
                                showAddServantRow={editMode}
                                visibleColumns={visibleColumns}
                                openLinksInNewTab={editMode}
                                onActivateServant={handleActiveServantChange}
                                onAddServant={handleAddServantButtonClick}
                                onEditServant={openEditServantDialog}
                                onDeleteServant={openDeleteServantDialog}
                            />
                        }
                    />
                    {md && <div className={`${StyleClassPrefix}-info-panel-container`}>
                        <LayoutPanelContainer className="flex column full-height" autoHeight>
                            <MasterServantInfoPanel
                                activeServant={activeServantRef.current}
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
