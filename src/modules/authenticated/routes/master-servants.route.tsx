import { Fab, IconButton, Tooltip } from '@material-ui/core';
import { Add as AddIcon, Clear as ClearIcon, Edit as EditIcon, Equalizer as EqualizerIcon, GetApp, Publish as PublishIcon, Save as SaveIcon } from '@material-ui/icons';
import lodash from 'lodash';
import React, { MouseEvent, PureComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { PromptDialog } from '../../../components/dialog/prompt-dialog.component';
import { FabContainer } from '../../../components/fab/fab-container.component';
import { NavigationRail } from '../../../components/navigation/navigation-rail.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { GameServantService } from '../../../services/data/game/game-servant.service';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { LoadingIndicatorOverlayService } from '../../../services/user-interface/loading-indicator-overlay.service';
import { GameServant, MasterAccount, MasterServant, MasterServantBondLevel, ModalOnCloseReason, Nullable, ReadonlyRecord } from '../../../types';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';
import { MasterServantEditDialog } from '../components/master/servant/edit-dialog/master-servant-edit-dialog.component';
import { MasterServantList } from '../components/master/servant/list/master-servant-list.component';

type Props = {

};

type State = {
    masterAccount?: MasterAccount | null;
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
    // TODO Do we really need to clone the structures above?
    lastInstanceId: number;
    editMode: boolean;
    /**
     * The servant being edited in the dialog, if any.
     */
    editServant?: MasterServant;
    editServantDialogOpen: boolean;
    deleteServant?: MasterServant;
    deleteServantDialogOpen: boolean;
    deleteServantDialogPrompt?: string;
    showNavRail: boolean;
    loadingIndicatorId?: string;
};

const MasterServants = class extends PureComponent<Props, State> {

    private _onCurrentMasterAccountChangeSubscription!: Subscription;

    private _onCurrentMasterAccountUpdatedSubscription!: Subscription;

    private _gameServantMap!: ReadonlyRecord<number, Readonly<GameServant>>;

    constructor(props: Props) {
        super(props);

        this.state = {
            masterServants: [],
            bondLevels: {},
            unlockedCostumes: [],
            lastInstanceId: -1,
            editMode: false,
            editServantDialogOpen: false,
            deleteServantDialogOpen: false,
            showNavRail: true
        };

        this._edit = this._edit.bind(this);
        this._save = this._save.bind(this);
        this._cancel = this._cancel.bind(this);
        this._onAddServantButtonClick = this._onAddServantButtonClick.bind(this);
        this._openEditServantDialog = this._openEditServantDialog.bind(this);
        this._handleAddServantDialogClose = this._handleAddServantDialogClose.bind(this);
        this._openDeleteServantDialog = this._openDeleteServantDialog.bind(this);
        this._closeDeleteServantDialog = this._closeDeleteServantDialog.bind(this);
        this._handleDeleteServantDialogClose = this._handleDeleteServantDialogClose.bind(this);
    }

    componentDidMount(): void {
        this._onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(this._handleCurrentMasterAccountChange.bind(this));
        this._onCurrentMasterAccountUpdatedSubscription = MasterAccountService.onCurrentMasterAccountUpdated
            .subscribe(this._handleCurrentMasterAccountUpdated.bind(this));

        GameServantService.getServantsMap().then(gameServantMap => {
            this._gameServantMap = gameServantMap;
            this.forceUpdate();
        });
    }

    componentWillUnmount(): void {
        this._onCurrentMasterAccountChangeSubscription.unsubscribe();
        this._onCurrentMasterAccountUpdatedSubscription.unsubscribe();
    }

    render(): ReactNode {
        if (!this._gameServantMap) {
            return null;
        }

        const {
            masterServants,
            bondLevels,
            unlockedCostumes,
            editMode,
            editServant,
            editServantDialogOpen,
            deleteServantDialogOpen,
            deleteServantDialogPrompt,
            showNavRail
        } = this.state;

        return (
            <NavigationRail 
                contents={this._renderNavRailContents()}
                show={showNavRail && !editMode}
                disableAnimations
            >
                <PageTitle>
                    {editMode ?
                        'Edit Servant Roster' :
                        'Servant Roster'
                    }
                </PageTitle>
                <MasterServantList
                    editMode={editMode}
                    showActions
                    showAddServantRow
                    openLinksInNewTab={editMode}
                    masterServants={masterServants}
                    bondLevels={bondLevels}
                    onAddServant={this._onAddServantButtonClick}
                    onEditServant={this._openEditServantDialog}
                    onDeleteServant={this._openDeleteServantDialog}
                />
                <FabContainer children={this._renderFab()} />
                <MasterServantEditDialog
                    open={editServantDialogOpen}
                    dialogTitle={editServant ? 'Edit Servant Info' : 'Add Servant'}
                    submitButtonLabel={editMode ? 'Done' : 'Save'}
                    disableServantSelect={!!editServant}
                    masterServant={editServant}
                    bondLevels={bondLevels}
                    unlockedCostumes={unlockedCostumes}
                    onClose={this._handleAddServantDialogClose}
                />
                <PromptDialog
                    open={deleteServantDialogOpen}
                    title="Delete Servant?"
                    prompt={deleteServantDialogPrompt}
                    cancelButtonColor="secondary"
                    confirmButtonColor="primary"
                    confirmButtonLabel="Delete"
                    onClose={this._handleDeleteServantDialogClose}
                />
            </NavigationRail>
        );
    }

    private _renderNavRailContents(): ReactNode {
        return [
            /*
            <Tooltip key="hide" title="Hide menu"  placement="right">
                <div>
                    <IconButton
                        onClick={() => this.setState({ showNavRail: !this.state.showNavRail })}
                        children={<ChevronLeftIcon />}
                    />
                </div>
            </Tooltip>,
            */
            <Tooltip key="add" title="Add servant" placement="right">
                <div>
                    <IconButton
                        onClick={this._onAddServantButtonClick}
                        children={<AddIcon />}
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
    }

    private _renderFab(): ReactNode {
        const { editMode, loadingIndicatorId } = this.state;
        const disabled = !!loadingIndicatorId;
        if (!editMode) {
            return (
                <Tooltip key="edit" title="Batch edit mode">
                    <div>
                        <Fab
                            color="primary"
                            onClick={this._edit}
                            disabled={disabled}
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
                        onClick={this._cancel}
                        disabled={disabled}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="save" title="Save changes">
                <div>
                    <Fab
                        color="primary"
                        onClick={this._save}
                        disabled={disabled}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }

    private _edit(): void {
        this.setState({
            editMode: true
        });
    }

    private _save(): void {
        const { masterServants, bondLevels, unlockedCostumes } = this.state;
        this._updateMasterAccount(masterServants, bondLevels, unlockedCostumes);
    }
    
    private _cancel(): void {
        const { masterAccount } = this.state;
        const { masterServants, bondLevels, unlockedCostumes } = this._cloneFromMasterAccount(masterAccount);
        this.setState({
            masterServants,
            bondLevels,
            unlockedCostumes,
            editMode: false
        });
    }

    private _onAddServantButtonClick(): void {
        this._openEditServantDialog();
    }

    private _openEditServantDialog(masterServant?: MasterServant): void {
        this.setState({
            editServant: masterServant,
            editServantDialogOpen: true,
            deleteServant: undefined,
            deleteServantDialogOpen: false 
        });
    }

    private _handleAddServantDialogClose(
        event: any,
        reason: any,
        data?: { masterServant: Omit<MasterServant, 'instanceId'>, bond: MasterServantBondLevel | undefined, costumes: Array<number> }
    ): void {
        
        /*
         * If `data` is undefined, then changes were cancelled.
         */
        if (!data) {
            return this.setState({
                editServant: undefined,
                editServantDialogOpen: false 
            });
        }

        const { editServant, editMode, bondLevels, unlockedCostumes } = this.state;
        let { masterServants, lastInstanceId } = this.state;
        const servantId = data.masterServant.gameId;

        bondLevels[servantId] = data.bond;

        /*
         * Update the unlocked costumes list.
         *
         * TODO Move this to a separate method/function.
         */
        const servant = this._gameServantMap[servantId];
        const costumesIds = Object.keys(servant.costumes).map(Number);
        unlockedCostumes.filter(c => costumesIds.indexOf(c) === -1);
        unlockedCostumes.push(...data.costumes);

        /*
         * If the servant is being added (regardless of in edit mode or not), then
         * `editServant` will be undefined. Conversely, if an existing servant is being
         * edited, then `editServant` should be defined.
         */
        if (!editServant) {
            const masterServant: MasterServant = {
                ...data.masterServant,
                instanceId: ++lastInstanceId
            };

            if (editMode) {
                /*
                 * In edit mode, the master servant array will need to be rebuilt to trigger a
                 * re-render after updating the component state.
                 */
                masterServants = [
                    ...masterServants,
                    masterServant
                ];
                
            } else {
                /*
                 * Otherwise, the update can be pushed to the server immediately. The response
                 * from the server will trigger a re-render of the component and its children,
                 * so no need to update the state.
                 */
                masterServants.push(masterServant);
                return this._updateMasterAccount(masterServants, bondLevels, unlockedCostumes);
            }

        } else {
            /*
             * Merge changes into existing servant object.
             */
            lodash.assign(editServant, data);

            if (editMode) {
                /*
                 * Just like the previous case, in edit mode, the master servant will need to
                 * be rebuilt to trigger a re-render after updating the component state. The
                 * updated servant will also have to be rebuilt to trigger re-render of some
                 * children components.
                 */
                masterServants = masterServants.map(servant => {
                    return servant === editServant ? { ...editServant } : servant;
                });

            } else {
                /*
                 * Otherwise, just immediately push update to server and return.
                 */
                return this._updateMasterAccount(masterServants, bondLevels, unlockedCostumes);
            }            
        }
        
        this.setState({
            masterServants,
            bondLevels,
            lastInstanceId,
            editServant: undefined,
            editServantDialogOpen: false
        });
    }
    
    private _openDeleteServantDialog(masterServant: MasterServant): void {
        const servant = this._gameServantMap[masterServant.gameId];
        const deleteServantDialogPrompt = `Are you sure you want to remove ${servant?.name} from the servant list?`;
        this.setState({
            editServant: undefined,
            editServantDialogOpen: false,
            deleteServant: masterServant,
            deleteServantDialogOpen: true,
            deleteServantDialogPrompt
        });
    }

    private _closeDeleteServantDialog(): void {
        return this.setState({
            deleteServantDialogOpen: false,
            deleteServantDialogPrompt: undefined
        });
    }

    private _handleDeleteServantDialogClose(event: MouseEvent, reason: ModalOnCloseReason): void {
        const {
            masterServants,
            bondLevels,
            unlockedCostumes,
            editMode,
            deleteServant
        } = this.state;
        if (reason !== 'submit') {
            return this._closeDeleteServantDialog();
        }
        lodash.remove(masterServants, servant => servant.instanceId === deleteServant?.instanceId);
        // TODO Remove bond/costume data if the last instance of the servant is removed.
        if (!editMode) {
            return this._updateMasterAccount(masterServants, bondLevels, unlockedCostumes);
        }
        this.setState({
            deleteServantDialogOpen: false,
            masterServants: [...masterServants] // FIXME Hacky way to force child to re-render
        });
    }

    /**
     * Sends master servant update request to the back-end.
     */
    private _updateMasterAccount(
        masterServants: MasterServant[],
        bondLevels: Record<number, MasterServantBondLevel | undefined>,
        unlockedCostumes: number[]
    ): void {

        const { masterAccount } = this.state;
        
        const update: Partial<MasterAccount> = {
            _id: masterAccount?._id,
            servants: masterServants,
            bondLevels: bondLevels as Record<number, MasterServantBondLevel>,
            costumes: unlockedCostumes
        };
        MasterAccountService.updateAccount(update)
            .catch(this._handleUpdateError.bind(this));

        let { loadingIndicatorId } = this.state;
        if (!loadingIndicatorId) {
            loadingIndicatorId = LoadingIndicatorOverlayService.invoke();
        }
        this.setState({
            editServant: undefined,
            editServantDialogOpen: false,
            deleteServant: undefined,
            deleteServantDialogOpen: false,
            loadingIndicatorId
        });
    }
    
    private _handleUpdateError(error: any): void {
        // TODO Display error message to user.
        console.error(error);
        const { masterAccount } = this.state;
        const { masterServants, bondLevels, unlockedCostumes } = this._cloneFromMasterAccount(masterAccount);
        const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
        this._resetLoadingIndicator();
        this.setState({
            masterServants,
            bondLevels,
            unlockedCostumes,
            lastInstanceId,
            editMode: false,
            editServant: undefined,
            editServantDialogOpen: false,
            deleteServant: undefined,
            deleteServantDialogOpen: false,
            loadingIndicatorId: undefined
        });
    }

    private _handleCurrentMasterAccountChange(account: Nullable<MasterAccount>): void {
        const { masterServants, bondLevels, unlockedCostumes } = this._cloneFromMasterAccount(account);
        const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
        this.setState({
            masterAccount: account,
            masterServants,
            bondLevels,
            unlockedCostumes,
            lastInstanceId,
            editMode: false
        });
    }

    private _handleCurrentMasterAccountUpdated(account: Nullable<MasterAccount>): void {
        if (account == null) {
            return;
        }
        const { masterServants, bondLevels, unlockedCostumes } = this._cloneFromMasterAccount(account);
        const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
        this._resetLoadingIndicator();
        this.setState({
            masterAccount: account,
            masterServants,
            bondLevels,
            unlockedCostumes,
            lastInstanceId,
            editMode: false,
            loadingIndicatorId: undefined
        });
    }

    private _resetLoadingIndicator(): void {
        const { loadingIndicatorId } = this.state;
        if (loadingIndicatorId) {
            LoadingIndicatorOverlayService.waive(loadingIndicatorId);
        }
    }

    private _cloneFromMasterAccount(account: Nullable<MasterAccount>): Pick<State, 'masterServants' | 'bondLevels' | 'unlockedCostumes'> {
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
    }

};

export const MasterServantsRoute = React.memo(() => <MasterServants />);
