import { Fab, Tooltip } from '@material-ui/core';
import { Clear as ClearIcon, Edit as EditIcon, Publish as PublishIcon, Save as SaveIcon } from '@material-ui/icons';
import lodash from 'lodash';
import React, { Fragment, MouseEvent, PureComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { Container as Injectables } from 'typedi';
import { RouteComponent } from '../../../components/base/route-component';
import { PromptDialog } from '../../../components/dialogs/prompt-dialog.component';
import { FabContainer } from '../../../components/fab-container.component';
import { GameServantService } from '../../../services/data/game/game-servant.service';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { LoadingIndicatorOverlayService } from '../../../services/user-interface/loading-indicator-overlay.service';
import { GameServant, MasterAccount, MasterServant, ModalOnCloseReason, Nullable, ReadonlyRecord } from '../../../types';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';
import { MasterServantEditDialog } from '../components/master/servant/edit-dialog/master-servant-edit-dialog.component';
import { MasterServantList } from '../components/master/servant/list/master-servant-list.component';

type Props = {
    
};

type State = {
    masterAccount?: MasterAccount | null;
    /**
     * Clone of the servants array from the MasterAccount object.
     */
    masterServants: MasterServant[];
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
    loadingIndicatorId?: string;
};

const MasterServants = class extends PureComponent<Props, State> {

    private _loadingIndicatorService = Injectables.get(LoadingIndicatorOverlayService);

    private _gameServantService = Injectables.get(GameServantService);

    private _masterAccountService = Injectables.get(MasterAccountService);

    private _onCurrentMasterAccountChangeSubscription!: Subscription;

    private _onCurrentMasterAccountUpdatedSubscription!: Subscription;

    private _gameServantMap!: ReadonlyRecord<number, Readonly<GameServant>>;

    constructor(props: Props) {
        super(props);

        this.state = {
            masterServants: [],
            lastInstanceId: -1,
            editMode: false,
            editServantDialogOpen: false,
            deleteServantDialogOpen: false
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
        this._onCurrentMasterAccountChangeSubscription = this._masterAccountService.onCurrentMasterAccountChange
            .subscribe(this._handleCurrentMasterAccountChange.bind(this));
        this._onCurrentMasterAccountUpdatedSubscription = this._masterAccountService.onCurrentMasterAccountUpdated
            .subscribe(this._handleCurrentMasterAccountUpdated.bind(this));

        this._gameServantService.getServantsMap().then(gameServantMap => {
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
            editMode,
            editServant,
            editServantDialogOpen,
            deleteServantDialogOpen,
            deleteServantDialogPrompt,
        } = this.state;

        return (
            <Fragment>
                <MasterServantList
                    editMode={editMode}
                    showActions
                    showAddServantRow
                    openLinksInNewTab={editMode}
                    masterServants={masterServants}
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
            </Fragment>
        );
    }

    private _renderFab(): ReactNode {
        const { editMode, loadingIndicatorId } = this.state;
        const disabled = !!loadingIndicatorId;
        if (!editMode) {
            return [
                <Tooltip key="import" title="Import servant data">
                    <div>
                        <Fab
                            component={Link}
                            color="default"
                            to="./data/import/servants"
                            disabled={disabled}
                            children={<PublishIcon />}
                        />
                    </div>
                </Tooltip>,
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
            ];
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
        const { masterServants } = this.state;
        this._updateMasterAccount(masterServants);
    }
    
    private _cancel(): void {
        const masterServants = this._cloneServantsFromMasterAccount(this.state.masterAccount);
        this.setState({
            masterServants,
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

    private _handleAddServantDialogClose(event: any, reason: any, data?: Omit<MasterServant, 'instanceId'>): void {
        /*
         * If `data` is undefined, then changes were cancelled.
         */
        if (!data) {
            return this.setState({
                editServant: undefined,
                editServantDialogOpen: false 
            });
        }

        const { masterServants, editServant, editMode } = this.state;
        let { lastInstanceId } = this.state;

        /*
         * If the servant is being added (regardless of in edit mode or not), then
         * `editServant` will be undefined. Conversely, if an existing servant is being
         * edited, then `editServant` should be defined. Note that it is not possible
         * to edit an existing servant when not in edit mode.
         */
        if (!editServant) {
            const masterServant: MasterServant = {
                ...data,
                instanceId: ++lastInstanceId
            };
            masterServants.push(masterServant);

            /*
             * If not in edit mode, then push update immediately. Otherwise, the save
             * button is responsible for triggering the update.
             */
            if (!editMode) {
                return this._updateMasterAccount(masterServants);
            }
            
        } else {
            /*
             * Merge changes into existing servant object.
             */
            lodash.assign(editServant, data);

            /*
             * Just like the previous case, if not in edit mode, then push update
             * immediately.
             */
            if (!editMode) {
                return this._updateMasterAccount(masterServants);
            }
        }
        
        this.setState({
            masterServants: [...masterServants], // FIXME Hacky way to force child to re-render
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
        const { masterServants, editMode, deleteServant } = this.state;
        if (reason !== 'submit') {
            return this._closeDeleteServantDialog();
        }
        lodash.remove(masterServants, servant => servant.instanceId === deleteServant?.instanceId);
        if (!editMode) {
            return this._updateMasterAccount(masterServants);
        }
        this.setState({
            deleteServantDialogOpen: false,
            masterServants: [...masterServants] // FIXME Hacky way to force child to re-render
        });
    }

    /**
     * Sends master servant update request to the back-end.
     */
    private _updateMasterAccount(masterServants: MasterServant[]): void {
        const { masterAccount } = this.state;
        
        const update = {
            _id: masterAccount?._id,
            servants: masterServants
        };
        this._masterAccountService.updateAccount(update)
            .catch(this._handleUpdateError.bind(this));

        let { loadingIndicatorId } = this.state;
        if (!loadingIndicatorId) {
            loadingIndicatorId = this._loadingIndicatorService.invoke();
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
        const masterServants = this._cloneServantsFromMasterAccount(masterAccount);
        const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
        this._resetLoadingIndicator();
        this.setState({
            masterServants,
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
        const masterServants = this._cloneServantsFromMasterAccount(account);
        const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
        this.setState({
            masterAccount: account,
            masterServants,
            lastInstanceId,
            editMode: false
        });
    }

    private _handleCurrentMasterAccountUpdated(account: Nullable<MasterAccount>): void {
        if (account == null) {
            return;
        }
        const masterServants = this._cloneServantsFromMasterAccount(account);
        const lastInstanceId = MasterServantUtils.getLastInstanceId(masterServants);
        this._resetLoadingIndicator();
        this.setState({
            masterAccount: account,
            masterServants,
            lastInstanceId,
            editMode: false,
            loadingIndicatorId: undefined
        });
    }

    private _resetLoadingIndicator(): void {
        const { loadingIndicatorId } = this.state;
        if (loadingIndicatorId) {
            this._loadingIndicatorService.waive(loadingIndicatorId);
        }
    }

    private _cloneServantsFromMasterAccount(account: Nullable<MasterAccount>): MasterServant[] {
        if (!account) {
            return [];
        }
        return account.servants.map(MasterServantUtils.clone);
    }

};

export class MasterServantsRoute extends RouteComponent {

    render(): ReactNode {
        return <MasterServants />;
    }

}
