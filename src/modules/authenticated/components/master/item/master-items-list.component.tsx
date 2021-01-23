import { Fab } from '@material-ui/core';
import { Clear as ClearIcon, Edit as EditIcon, Save as SaveIcon } from '@material-ui/icons';
import { FabContainer, MasterItemsListView } from 'components';
import { MasterAccount, MasterItem } from 'data';
import { Nullable } from 'internal';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { MasterAccountService } from 'services';
import { Container as Injectables } from 'typedi';

type Props = {
    
};

type State = {
    userAccount?: MasterAccount | null;
    /**
     * Clone of the items array from the MasterAccount object.
     */
    masterItems: MasterItem[];
    editMode: boolean;
};

export class MasterItemsList extends PureComponent<Props, State> {
    
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
                <MasterItemsListView editMode={editMode} masterItems={masterItems} />
                <FabContainer>
                    {this._renderFab(editMode)}
                </FabContainer>
            </Fragment>
        );
    }

    private _renderFab(editMode: boolean): ReactNode {
        if (!editMode) {
            return (
                <Fab color="primary" onClick={this._edit}>
                    <EditIcon />
                </Fab>
            );
        }
        return [
            <Fab key="save" color="primary" onClick={this._save}>
                <SaveIcon />
            </Fab>,
            <Fab key="cancel" color="secondary" onClick={this._cancel}>
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
        const { userAccount, masterItems } = this.state;
        const accountUpdate: Partial<MasterAccount> = {
            _id: userAccount?._id,
            items: masterItems
        };
        await this._masterAccountService.updateAccount(accountUpdate);
        this.setState({
            editMode: false
        });
    }
    
    private _cancel() {
        const masterItems = this._cloneItemsFromMasterAccount(this.state.userAccount);
        this.setState({
            masterItems,
            editMode: false
        });
    }

    private _handleCurrentMasterAccountChange(account: Nullable<MasterAccount>) {
        const masterItems = this._cloneItemsFromMasterAccount(account);
        this.setState({
            userAccount: account,
            masterItems,
            editMode: false
        });
    }

    private _handleCurrentMasterAccountUpdated(account: Nullable<MasterAccount>) {
        if (account == null) {
            return;
        }
        const masterItems = this._cloneItemsFromMasterAccount(account);
        this.setState({
            userAccount: account,
            masterItems
            // TODO Also set editMode to false?
        });
    }

    private _cloneItemsFromMasterAccount(account: Nullable<MasterAccount>) {
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
