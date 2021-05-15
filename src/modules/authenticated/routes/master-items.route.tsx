import { Fab, IconButton, Tooltip } from '@material-ui/core';
import { Clear as ClearIcon, Edit as EditIcon, Equalizer as EqualizerIcon, GetApp, Publish as PublishIcon, Save as SaveIcon } from '@material-ui/icons';
import React, { PureComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { FabContainer } from '../../../components/fab/fab-container.component';
import { LayoutPanelScrollable } from '../../../components/layout/layout-panel-scrollable.component';
import { NavigationRail } from '../../../components/navigation/navigation-rail.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { LoadingIndicatorOverlayService } from '../../../services/user-interface/loading-indicator-overlay.service';
import { MasterAccount, MasterItem, Nullable } from '../../../types';
import { MasterItemList } from '../components/master/item/list/master-item-list.component';

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

const MasterItems = class extends PureComponent<Props, State> {
    
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
            <div className="flex column full-height">
                <PageTitle>
                    {editMode ?
                        'Edit Item Inventory' :
                        'Item Inventory'
                    }
                </PageTitle>
                <div className="flex overflow-hidden">
                    <NavigationRail>
                        {this._renderNavRailContents()}
                    </NavigationRail>
                    <LayoutPanelScrollable className="py-4 pr-4 full-height flex-fill">
                        <MasterItemList editMode={editMode} masterItems={masterItems} />
                    </LayoutPanelScrollable>
                </div>
                <FabContainer children={this._renderFab(editMode)} />
            </div>
        );
    }

    private _renderNavRailContents(): ReactNode {
        return [
            <Tooltip key="stats" title="Item stats" placement="right">
                <div>
                    <IconButton
                        component={Link}
                        to="items/stats"
                        children={<EqualizerIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="import" title="Upload item data" placement="right">
                <div>
                    {/* TODO Implement this */}
                    <IconButton children={<PublishIcon />} disabled />
                </div>
            </Tooltip>,
            <Tooltip key="export" title="Download item data" placement="right">
                <div>
                    {/* TODO Implement this */}
                    <IconButton children={<GetApp />} disabled />
                </div>
            </Tooltip>
        ];
    }

    private _renderFab(editMode: boolean): ReactNode {
        const { loadingIndicatorId } = this.state;
        const disabled = !!loadingIndicatorId;
        if (!editMode) {
            return (
                <Tooltip key="edit" title="Edit">
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

};

export const MasterItemsRoute = React.memo(() => <MasterItems />);
