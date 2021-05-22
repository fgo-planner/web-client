import { Fab, IconButton, Tooltip } from '@material-ui/core';
import { Add as AddIcon, Clear as ClearIcon, Edit as EditIcon, Equalizer as EqualizerIcon, GetApp, Publish as PublishIcon, Save as SaveIcon } from '@material-ui/icons';
import lodash from 'lodash';
import React, { MouseEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PromptDialog } from '../../../components/dialog/prompt-dialog.component';
import { FabContainer } from '../../../components/fab/fab-container.component';
import { LayoutPanelScrollable } from '../../../components/layout/layout-panel-scrollable.component';
import { NavigationRail } from '../../../components/navigation/navigation-rail.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { useActiveBreakpoints } from '../../../hooks/use-active-breakpoints.hook';
import { GameServantMap, GameServantService } from '../../../services/data/game/game-servant.service';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { LoadingIndicatorOverlayService } from '../../../services/user-interface/loading-indicator-overlay.service';
import { MasterAccount, MasterServant, MasterServantBondLevel, ModalOnCloseReason, Nullable } from '../../../types';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';
import { MasterServantEditDialog } from '../components/master/servant/edit-dialog/master-servant-edit-dialog.component';
import { MasterServantListVisibleColumns } from '../components/master/servant/list/master-servant-list-columns';
import { MasterServantListHeader } from '../components/master/servant/list/master-servant-list-header.component';
import { MasterServantList } from '../components/master/servant/list/master-servant-list.component';

type Props = {

};

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

export const MasterServantsRoute = React.memo((props: Props) => {

    const [gameServantMap, setGameServantMap] = useState<GameServantMap>();
    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    /**
     * Clone of the `servants` array from the MasterAccount object.
     */
    const [masterServants, setMasterServants] = useState<Array<MasterServant>>([]);
    /**
     * Clone of the `bondLevels` map from the MasterAccount object.
     */
    const [bondLevels, setBondLevels] = useState<Record<number, MasterServantBondLevel | undefined>>({});
    /**
     * Clone of the `costumes` map from the MasterAccount object.
     */
    const [unlockedCostumes, setUnlockedCostumes] = useState<Array<number>>([]);
    // TODO Do we really need to clone the structures above?
    const [lastInstanceId, setLastInstanceId] = useState<number>(-1);
    const [activeServant, setActiveServant] = useState<MasterServant>();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editServant, setEditServant] = useState<MasterServant>();
    const [editServantDialogOpen, setEditServantDialogOpen] = useState<boolean>(false);
    const [deleteServant, setDeleteServant] = useState<MasterServant>();
    const [deleteServantDialogOpen, setDeleteServantDialogOpen] = useState<boolean>(false);
    // const [deleteServantDialogPrompt, setDeleteServantDialogPrompt] = useState<string>();
    const [loadingIndicatorId, setLoadingIndicatorId] = useState<string>();

    const { md, lg, xl } = useActiveBreakpoints();

    const visibleColumns = useMemo((): MasterServantListVisibleColumns => ({
        npLevel: lg,
        level: md,
        bondLevel: xl,
        fouHp: lg,
        fouAtk: lg,
        skillLevels: md,
        actions: false
    }), [md, lg, xl]);

    /*
     * Retrieve game servant map.
     */
    useEffect(() => {
        GameServantService.getServantsMap().then(gameServantMap => {
            setGameServantMap(gameServantMap);
        });
    }, []);

    const deleteServantDialogPrompt = useMemo((): string | undefined => {
        if (!gameServantMap || !deleteServant) {
            return undefined;
        }
        const servant = gameServantMap[deleteServant.gameId];
        return `Are you sure you want to remove ${servant?.name} from the servant list?`;
    }, [gameServantMap, deleteServant]);

    const resetLoadingIndicator = useCallback((): void => {
        if (loadingIndicatorId) {
            LoadingIndicatorOverlayService.waive(loadingIndicatorId);
            setLoadingIndicatorId(undefined);
        }
    }, [loadingIndicatorId]);

    /**
     * onCurrentMasterAccountChange subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(account => {
                const { masterServants, bondLevels, unlockedCostumes } = cloneFromMasterAccount(account);
                const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
                setMasterAccount(account);
                setMasterServants(masterServants);
                setBondLevels(bondLevels);
                setUnlockedCostumes(unlockedCostumes);
                setLastInstanceId(lastInstanceId);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

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
                resetLoadingIndicator();
                setMasterAccount(account);
                setMasterServants(masterServants);
                setBondLevels(bondLevels);
                setUnlockedCostumes(unlockedCostumes);
                setLastInstanceId(lastInstanceId);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountUpdatedSubscription.unsubscribe();
    }, [resetLoadingIndicator]);

    const handleUpdateError = useCallback((error: any): void => {
        // TODO Display error message to user.
        console.error(error);
        const { masterServants, bondLevels, unlockedCostumes } = cloneFromMasterAccount(masterAccount);
        const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
        resetLoadingIndicator();
        setMasterServants(masterServants);
        setBondLevels(bondLevels);
        setUnlockedCostumes(unlockedCostumes);
        setLastInstanceId(lastInstanceId);
        setEditMode(false);
        setEditServant(undefined);
        setEditServantDialogOpen(false);
        setDeleteServant(undefined);
        setDeleteServantDialogOpen(false);
    }, [masterAccount, resetLoadingIndicator]);

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

        let _loadingIndicatorId = loadingIndicatorId;
        if (!_loadingIndicatorId) {
            _loadingIndicatorId = LoadingIndicatorOverlayService.invoke();
        }

        setEditServant(undefined);
        setEditServantDialogOpen(false);
        setDeleteServant(undefined);
        setDeleteServantDialogOpen(false);
        setLoadingIndicatorId(_loadingIndicatorId);
    }, [loadingIndicatorId, masterAccount?._id, handleUpdateError]);

    const handleEditButtonClick = useCallback((): void => {
        setEditMode(true);
    }, []);

    const handleSaveButtonClick = useCallback((): void => {
        updateMasterAccount(masterServants, bondLevels, unlockedCostumes);
    }, [masterServants, bondLevels, unlockedCostumes, updateMasterAccount]);
    
    const handleCancelButtonClick = useCallback((): void => {
        const { masterServants, bondLevels, unlockedCostumes } = cloneFromMasterAccount(masterAccount);
        setMasterServants(masterServants);
        setBondLevels(bondLevels);
        setUnlockedCostumes(unlockedCostumes);
        setEditMode(false);
    }, [masterAccount]);

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

    if (!gameServantMap) {
        return null;
    }

    /**
     * NavigationRail contents
     */
    const navigationRailContents: ReactNode = [
        <Tooltip key="add" title="Add servant" placement="right">
            <div>
                <IconButton
                    onClick={handleAddServantButtonClick}
                    children={<AddIcon />}
                    disabled={!editMode}
                />
            </div>
        </Tooltip>,
        <Tooltip key="stats" title="Servant stats" placement="right">
            <div>
                <IconButton
                    component={Link}
                    to="servants/stats"
                    children={<EqualizerIcon />}
                />
            </div>
        </Tooltip>,
        <Tooltip key="import" title="Upload servant data" placement="right">
            <div>
                <IconButton
                    component={Link}
                    to="./data/import/servants"
                    children={<PublishIcon />}
                />
            </div>
        </Tooltip>,
        <Tooltip key="export" title="Download servant data" placement="right">
            <div>
                {/* TODO Implement this */}
                <IconButton children={<GetApp />} disabled />
            </div>
        </Tooltip>
    ];

    /**
     * FabContainer contents
     */
    let fabContainerContents: ReactNode;
    if (!editMode) {
        fabContainerContents = (
            <Tooltip key="edit" title="Batch edit mode">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleEditButtonClick}
                        disabled={!!loadingIndicatorId}
                        children={<EditIcon />}
                    />
                </div>
            </Tooltip>
        );
    } else {
        fabContainerContents = [
            <Tooltip key="cancel" title="Cancel">
                <div>
                    <Fab
                        color="default"
                        onClick={handleCancelButtonClick}
                        disabled={!!loadingIndicatorId}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="save" title="Save changes">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleSaveButtonClick}
                        disabled={!!loadingIndicatorId}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }

    return (
        <div className="flex column full-height">
            <PageTitle>
                {editMode ?
                    'Edit Servant Roster' :
                    'Servant Roster'
                }
            </PageTitle>
            <div className="flex overflow-hidden">
                <NavigationRail children={navigationRailContents} />
                <div className="flex flex-fill">
                    <LayoutPanelScrollable
                        className="py-4 pr-4 full-height flex-fill"
                        headerContents={
                            <MasterServantListHeader 
                                editMode={editMode}
                                visibleColumns={visibleColumns}
                            />
                        }
                        children={
                            <MasterServantList
                                gameServantMap={gameServantMap}
                                masterServants={masterServants}
                                bondLevels={bondLevels}
                                activeServant={activeServant}
                                editMode={editMode}
                                showAddServantRow={editMode}
                                borderRight
                                visibleColumns={visibleColumns}
                                openLinksInNewTab={editMode}
                                onActivateServant={setActiveServant}
                                onAddServant={handleAddServantButtonClick}
                                onEditServant={openEditServantDialog}
                                onDeleteServant={openDeleteServantDialog}
                            />
                        }
                    />
                </div>
            </div>
            <FabContainer children={fabContainerContents} />
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
        </div>
    );
});
