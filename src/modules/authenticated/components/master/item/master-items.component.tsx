import { Fab } from '@material-ui/core';
import { Clear as ClearIcon, Edit as EditIcon, Save as SaveIcon } from '@material-ui/icons';
import { FabContainer, MasterItemList } from 'components';
import { MasterAccount, MasterItem } from 'data';
import { Nullable } from 'internal';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { LoadingIndicatorOverlayService, MasterAccountService } from 'services';
import { Container as Injectables } from 'typedi';

type Props = {
    
};

type State = {
    masterAccount?: MasterAccount | null;
    /**
     * Clone of the items array from the MasterAccount object.
     */
    masterItems: MasterItem[];
    editMode: boolean;
    loadingIndicatorId?: string;
};

export class MasterItems extends PureComponent<Props, State> {
    
    private _loadingIndicatorService = Injectables.get(LoadingIndicatorOverlayService);
    
    private _masterAccountService = Injectables.get(MasterAccountService);

    private _onCurrentMasterAccountChangeSubscription!: Subscription;

    private _onCurrentMasterAccountUpdatedSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            masterItems: [],
            editMode: false
        };

        this._edit = this._edit.bind(this);
        this._save = this._save.bind(this);
        this._cancel = this._cancel.bind(this);
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
        const { masterItems, editMode } = this.state;
        return (
            <Fragment>
                <MasterItemList editMode={editMode} masterItems={masterItems} />
                <FabContainer>
                    {this._renderFab(editMode)}
                </FabContainer>
            </Fragment>
        );
    }

    private _renderFab(editMode: boolean): ReactNode {
        const { loadingIndicatorId } = this.state;
        if (!editMode) {
            return (
                <Fab color="primary" onClick={this._edit} disabled={!!loadingIndicatorId}>
                    <EditIcon />
                </Fab>
            );
        }
        return [
            <Fab key="save" color="primary" onClick={this._save} disabled={!!loadingIndicatorId}>
                <SaveIcon />
            </Fab>,
            <Fab key="cancel" color="secondary" onClick={this._cancel} disabled={!!loadingIndicatorId}>
                <ClearIcon />
            </Fab>
        ];
    }

    private _edit(): void {
        this.setState({
            editMode: true
        });
    }

    private _save(): void {
        const { masterAccount, masterItems } = this.state;

        const update = {
            _id: masterAccount?._id,
            items: masterItems
        };
        this._masterAccountService.updateAccount(update)
            .catch(this._handleUpdateError.bind(this));

        let { loadingIndicatorId } = this.state;
        if (!loadingIndicatorId) {
            loadingIndicatorId = this._loadingIndicatorService.invoke();
        }
        this.setState({
            loadingIndicatorId
        });
    }
    
    private _cancel(): void {
        const masterItems = this._cloneItemsFromMasterAccount(this.state.masterAccount);
        this.setState({
            masterItems,
            editMode: false
        });
    }

    private _handleUpdateError(error: any): void {
        // TODO Display error message to user.
        console.error(error);
        const { masterAccount } = this.state;
        const masterItems = this._cloneItemsFromMasterAccount(masterAccount);
        this._resetLoadingIndicator();
        this.setState({
            masterItems,
            editMode: false,
            loadingIndicatorId: undefined
        });
    }

    private _handleCurrentMasterAccountChange(account: Nullable<MasterAccount>): void {
        const masterItems = this._cloneItemsFromMasterAccount(account);
        this.setState({
            masterAccount: account,
            masterItems,
            editMode: false
        });
    }

    private _handleCurrentMasterAccountUpdated(account: Nullable<MasterAccount>): void {
        if (account == null) {
            return;
        }
        const masterItems = this._cloneItemsFromMasterAccount(account);
        this._resetLoadingIndicator();
        this.setState({
            masterAccount: account,
            masterItems,
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

    private _cloneItemsFromMasterAccount(account: Nullable<MasterAccount>): MasterItem[] {
        if (!account) {
            return [];
        }
        const masterItems: MasterItem[] = [];
        for (const masterItem of account.items) {
            masterItems.push({ ...masterItem });
        }
        return masterItems;
    }

}
