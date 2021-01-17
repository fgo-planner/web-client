import { Fab, StyleRules, Theme, withStyles } from '@material-ui/core';
import { Clear as ClearIcon, Edit as EditIcon, Save as SaveIcon } from '@material-ui/icons';
import { UserGameAccount, UserGameAccountItem } from 'data';
import { Nullable, WithStylesProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { UserGameAccountService } from 'services';
import { Container as Injectables } from 'typedi';
import { FabContainer } from '../../../../components/common/fab-container.component';
import { GameAccountItemsListView } from '../../../../components/common/game-account/game-account-items-list-view.component';

type Props = WithStylesProps;

type State = {
    userAccount?: UserGameAccount | null;
    /**
     * Clone of the items array from the UserGameAccount object.
     */
    userItems: UserGameAccountItem[];
    editMode: boolean;
};

const style = (theme: Theme) => ({
    root: {
        padding: theme.spacing(2, 0)
    }
} as StyleRules);

export const GameAccountItems = withStyles(style)(class extends PureComponent<Props, State> {
    
    private _gameAccountService = Injectables.get(UserGameAccountService);

    private _onCurrentGameAccountChangeSubscription!: Subscription;

    private _onCurrentGameAccountUpdatedSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            userItems: [],
            editMode: false
        };

        this._edit = this._edit.bind(this);
        this._save = this._save.bind(this);
        this._cancel = this._cancel.bind(this);
    }

    componentDidMount() {
        this._onCurrentGameAccountChangeSubscription = this._gameAccountService.onCurrentGameAccountChange
            .subscribe(this._handleCurrentGameAccountChange.bind(this));
        this._onCurrentGameAccountUpdatedSubscription = this._gameAccountService.onCurrentGameAccountUpdated
            .subscribe(this._handleCurrentGameAccountUpdated.bind(this));
    }

    componentWillUnmount() {
        this._onCurrentGameAccountChangeSubscription.unsubscribe();
        this._onCurrentGameAccountUpdatedSubscription.unsubscribe();
    }

    render(): ReactNode {
        const { classes } = this.props;
        const { userItems, editMode } = this.state;
        return (
            <div className={classes.root}>
                <GameAccountItemsListView editMode={editMode} userItems={userItems} />
                <FabContainer>
                    {this._renderFab(editMode)}
                </FabContainer>
            </div>
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
        const { userAccount, userItems } = this.state;
        const accountUpdate: Partial<UserGameAccount> = {
            _id: userAccount?._id,
            items: userItems
        };
        await this._gameAccountService.updateAccount(accountUpdate);
        this.setState({
            editMode: false
        });
    }
    
    private _cancel() {
        const userItems = this._cloneItemsFromGameAccount(this.state.userAccount);
        this.setState({
            userItems,
            editMode: false
        });
    }

    private _handleCurrentGameAccountChange(account: Nullable<UserGameAccount>) {
        const userItems = this._cloneItemsFromGameAccount(account);
        this.setState({
            userAccount: account,
            userItems,
            editMode: false
        });
    }

    private _handleCurrentGameAccountUpdated(account: Nullable<UserGameAccount>) {
        if (account == null) {
            return;
        }
        const userItems = this._cloneItemsFromGameAccount(account);
        this.setState({
            userAccount: account,
            userItems
            // TODO Also set editMode to false?
        });
    }

    private _cloneItemsFromGameAccount(account: Nullable<UserGameAccount>) {
        if (!account) {
            return [];
        }
        const userItems: UserGameAccountItem[] = [];
        for (const userItem of account.items) {
            userItems.push({ ...userItem });
        }
        return userItems;
    }

});