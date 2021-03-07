import { Fab, Tooltip } from '@material-ui/core';
import { Clear as ClearIcon, Edit as EditIcon, Equalizer as EqualizerIcon, Save as SaveIcon } from '@material-ui/icons';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import React, { PureComponent, ReactNode } from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps as ReactRouteComponentProps } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { FabContainer } from '../../../components/fab/fab-container.component';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { LoadingIndicatorOverlayService } from '../../../services/user-interface/loading-indicator-overlay.service';
import { MasterAccount, MasterItem, Nullable } from '../../../types';
import { MasterItemList } from '../components/master/item/list/master-item-list.component';

type Props = ReactRouteComponentProps;

type State = {
    masterAccount?: MasterAccount | null;
    /**
     * Clone of the items array from the MasterAccount object.
     */
    masterItems: MasterItem[];
    editMode: boolean;
    speedDialOpen: boolean;
    loadingIndicatorId?: string;
};

const MasterItems = withRouter(class extends PureComponent<Props, State> {
    
    private _onCurrentMasterAccountChangeSubscription!: Subscription;

    private _onCurrentMasterAccountUpdatedSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            masterItems: [],
            editMode: false,
            speedDialOpen: false
        };

        this._edit = this._edit.bind(this);
        this._save = this._save.bind(this);
        this._cancel = this._cancel.bind(this);
        this._toggleSpeedDial = this._toggleSpeedDial.bind(this);
    }

    componentDidMount(): void {
        this._onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(this._handleCurrentMasterAccountChange.bind(this));
        this._onCurrentMasterAccountUpdatedSubscription = MasterAccountService.onCurrentMasterAccountUpdated
            .subscribe(this._handleCurrentMasterAccountUpdated.bind(this));
    }

    componentWillUnmount(): void {
        this._onCurrentMasterAccountChangeSubscription.unsubscribe();
        this._onCurrentMasterAccountUpdatedSubscription.unsubscribe();
    }

    render(): ReactNode {
        const { masterItems, editMode } = this.state;
        return (
            <div className="py-2">
                <MasterItemList editMode={editMode} masterItems={masterItems} />
                <FabContainer children={this._renderFab(editMode)} />
            </div>
        );
    }

    private _renderFab(editMode: boolean): ReactNode {
        const { history } = this.props;
        const { speedDialOpen, loadingIndicatorId } = this.state;
        const disabled = !!loadingIndicatorId;
        if (!editMode) {
            return [
                <Tooltip key="edit" title="Edit">
                    <div>
                        <Fab
                            color="primary"
                            onClick={this._edit}
                            disabled={disabled}
                            children={<EditIcon />}
                        />
                    </div>
                </Tooltip>,
                <SpeedDial
                    key="speed-dial"
                    ariaLabel="Why is this needed?"
                    FabProps={{
                        color: 'default'
                    }}
                    icon={<SpeedDialIcon />}
                    open={speedDialOpen}
                    onClick={this._toggleSpeedDial}
                >
                    <SpeedDialAction
                        icon={<EqualizerIcon />}
                        tooltipTitle="Item stats"
                        onClick={() => history.push('items/stats')}
                    />
                </SpeedDial>
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
            <Tooltip key="save" title="Save">
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
        const { masterAccount, masterItems } = this.state;

        const update = {
            _id: masterAccount?._id,
            items: masterItems
        };
        MasterAccountService.updateAccount(update)
            .catch(this._handleUpdateError.bind(this));

        let { loadingIndicatorId } = this.state;
        if (!loadingIndicatorId) {
            loadingIndicatorId = LoadingIndicatorOverlayService.invoke();
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
            LoadingIndicatorOverlayService.waive(loadingIndicatorId);
        }
    }

    private _toggleSpeedDial(): void {
        const { speedDialOpen } = this.state;
        this.setState({
            speedDialOpen: !speedDialOpen
        });
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

});

export const MasterItemsRoute = React.memo(() => <MasterItems />);
