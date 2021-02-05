import { Fab } from '@material-ui/core';
import { Add as AddIcon, Clear as ClearIcon, Edit as EditIcon, Save as SaveIcon } from '@material-ui/icons';
import { FabContainer, MasterServantEditDialog, MasterServantsListView } from 'components';
import { MasterAccount, MasterServant } from 'data';
import { Nullable } from 'internal';
import lodash from 'lodash';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { MasterAccountService } from 'services';
import { Container as Injectables } from 'typedi';
import { MasterServantUtils } from 'utils';

type Props = {
    
};

type State = {
    userAccount?: MasterAccount | null;
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
    requestPending: boolean;
};

export class MasterServantsList extends PureComponent<Props, State> {

    private _masterAccountService = Injectables.get(MasterAccountService);

    private _onCurrentMasterAccountChangeSubscription!: Subscription;

    private _onCurrentMasterAccountUpdatedSubscription!: Subscription;

    constructor(props: Props) {
        super(props);

        this.state = {
            masterServants: [],
            lastInstanceId: -1,
            editMode: false,
            editServantDialogOpen: false,
            requestPending: false
        };

        this._edit = this._edit.bind(this);
        this._save = this._save.bind(this);
        this._cancel = this._cancel.bind(this);
        this._onAddServantButtonClick = this._onAddServantButtonClick.bind(this);
        this._openEditServantDialog = this._openEditServantDialog.bind(this);
        this._handleAddServantDialogClose = this._handleAddServantDialogClose.bind(this);
    }

    componentDidMount() {
        this._onCurrentMasterAccountChangeSubscription = this._masterAccountService.onCurrentMasterAccountChange
            .subscribe(this._handleCurrentMasterAccountChange.bind(this));
        this._onCurrentMasterAccountUpdatedSubscription = this._masterAccountService.onCurrentMasterAccountUpdated
            .subscribe(this._handleCurrentMasterAccountUpdated.bind(this));
    }

    componentWillUnmount() {
        this._onCurrentMasterAccountChangeSubscription.unsubscribe();
        this._onCurrentMasterAccountUpdatedSubscription.unsubscribe();
    }

    render(): ReactNode {
        const { masterServants, editMode, editServant, editServantDialogOpen } = this.state;
        return (
            <Fragment>
                <MasterServantsListView 
                    editMode={editMode}
                    masterServants={masterServants}
                    onEditServant={this._openEditServantDialog}
                />
                <FabContainer>
                    {this._renderFab(editMode)}
                </FabContainer>
                <MasterServantEditDialog
                    open={editServantDialogOpen}
                    dialogTitle={editServant ? 'Edit Servant Info' : 'Add Servant'}
                    submitButtonLabel={editMode ? 'Done' : 'Save'}
                    disableServantSelect={!!editServant}
                    masterServant={editServant}
                    onClose={this._handleAddServantDialogClose}
                />
            </Fragment>
        );
    }


    private _renderFab(editMode: boolean): ReactNode {
        const { requestPending } = this.state;
        const addButton = (
            <Fab key="add" color="primary" onClick={this._onAddServantButtonClick} disabled={requestPending}>
                <AddIcon />
            </Fab>
        );
        if (!editMode) {
            return [
                addButton,
                <Fab key="edit" color="primary" onClick={this._edit} disabled={requestPending}>
                    <EditIcon />
                </Fab>
            ];
        }
        return [
            addButton,
            <Fab key="save" color="primary" onClick={this._save} disabled={requestPending}>
                <SaveIcon />
            </Fab>,
            <Fab key="cancel" color="secondary" onClick={this._cancel} disabled={requestPending}>
                <ClearIcon />
            </Fab>
        ];
    }

    private _edit() {
        this.setState({
            editMode: true
        });
    }

    private async _save(): Promise<void> {
        const { masterServants } = this.state;
        this._updateMasterAccount(masterServants);
    }
    
    private _cancel() {
        const masterServants = this._cloneServantsFromMasterAccount(this.state.userAccount);
        this.setState({
            masterServants,
            editMode: false
        });
    }

    private _onAddServantButtonClick() {
        this._openEditServantDialog();
    }

    private _openEditServantDialog(masterServant?: MasterServant) {
        this.setState({
            editServant: masterServant,
            editServantDialogOpen: true
        });
    }

    private _handleAddServantDialogClose(event: any, reason: any, data?: Omit<MasterServant, 'instanceId'>): void {
        /*
         * If `data` is undefined, then changes were cancelled.
         */
        if (!data) {
            return this.setState({ 
                editServantDialogOpen: false 
            });
        }

        const {  masterServants, lastInstanceId, editServant, editMode } = this.state;

        /*
         * If the servant is being added (regardless of in edit mode or not), then
         * `editServant` will be undefined. Conversely, if an existing servant is being
         * edited, then `editServant` should be defined. Note that it is not possible
         * to edit an existing servant when not in edit mode.
         */
        if (!editServant) {
            const masterServant: MasterServant = {
                ...data,
                instanceId: lastInstanceId + 1
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
            lodash.merge(editServant, data);

            /*
             * Just like the previous case, if not in edit mode, then push update
             * immediately.
             */
            if (!editMode) {
                return this._updateMasterAccount(masterServants);
            }
        }
        
        this.setState({
            editServantDialogOpen: false,
            masterServants: [...masterServants] // FIXME Hacky way to force child to re-render
        });
    }

    /**
     * Sends master servant update request to the back-end.
     */
    private _updateMasterAccount(masterServants: MasterServant[]): void {
        const { userAccount } = this.state;
        this._masterAccountService.updateAccount({
            _id: userAccount?._id,
            servants: masterServants
        });
        this.setState({
            editServantDialogOpen: false,
            requestPending: true
        });
    }

    private _handleCurrentMasterAccountChange(account: Nullable<MasterAccount>) {
        const masterServants = this._cloneServantsFromMasterAccount(account);
        const lastInstanceId = this._getLastInstanceId(masterServants);
        this.setState({
            userAccount: account,
            masterServants,
            lastInstanceId,
            editMode: false
        });
    }

    private _handleCurrentMasterAccountUpdated(account: Nullable<MasterAccount>) {
        if (account == null) {
            return;
        }
        const masterServants = this._cloneServantsFromMasterAccount(account);
        const lastInstanceId = this._getLastInstanceId(masterServants);
        this.setState({
            userAccount: account,
            masterServants,
            lastInstanceId,
            editMode: false,
            requestPending: false
        });
    }

    private _getLastInstanceId(masterServants: MasterServant[]) {
        if (!masterServants.length) {
            return -1;
        }
        return  Math.max(...masterServants.map(servant => servant.instanceId));
    }

    private _cloneServantsFromMasterAccount(account: Nullable<MasterAccount>) {
        if (!account) {
            return [];
        }
        return account.servants.map(MasterServantUtils.clone);
    }

}
