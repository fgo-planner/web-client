import { MenuItem, StyleRules, TextField, Theme, withStyles } from '@material-ui/core';
import { UserGameAccount } from 'data';
import { Nullable, ReadonlyPartialArray, WithStylesProps } from 'internal';
import React, { ChangeEvent, PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { UserGameAccountService } from 'services';
import { Container as Injectables } from 'typedi';

type Props = WithStylesProps;

type State = {
    gameAccountList: ReadonlyPartialArray<UserGameAccount>;
    currentGameAccountId: string;
};

const style = (theme: Theme) => ({
    root: {
        width: theme.spacing(56),
        background: theme.palette.background.default,
    },
    selectOption: {
        height: theme.spacing(10)
    }
} as StyleRules);

export const AppBarGameAccountSelect = withStyles(style)(class extends PureComponent<Props, State> {

    private _userGameAccountService = Injectables.get(UserGameAccountService);

    private _onCurrentGameAccountChangeSubscription!: Subscription;

    private _onGameAccountListUpdatedSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            gameAccountList: [],
            currentGameAccountId: ''
        };
        this._renderSelectOption = this._renderSelectOption.bind(this);
        this._handleInputChange = this._handleInputChange.bind(this);
    }

    componentDidMount() {
        this._onCurrentGameAccountChangeSubscription = this._userGameAccountService.onCurrentGameAccountChange
            .subscribe(this._handleCurrentGameAccountChange.bind(this));
        this._onGameAccountListUpdatedSubscription = this._userGameAccountService.onGameAccountListUpdated
            .subscribe(this._handleGameAccountListUpdated.bind(this));
    }

    componentWillUnmount() {
        this._onCurrentGameAccountChangeSubscription.unsubscribe();
        this._onGameAccountListUpdatedSubscription.unsubscribe();
    }

    render(): ReactNode {
        return (
            <TextField select 
                       variant="outlined"
                       size="small"
                       className={this.props.classes.root}
                       value={this.state.currentGameAccountId}
                       onChange={this._handleInputChange}>
                 {this.state.gameAccountList.map(this._renderSelectOption)}
            </TextField>
        );
    }

    private _renderSelectOption(account: Partial<UserGameAccount>, index: number): ReactNode {
        let itemLabel = account.name || `Account ${index + 1}`;
        if (account.friendId) {
            itemLabel += ` (${account.friendId})`;
        }
        return (
            <MenuItem className={this.props.classes.selectOption}
                      value={account._id}
                      key={index}>
                {itemLabel}
            </MenuItem>
        );
    }

    private _handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
        const value = event.target.value;
        this._updateCurrentGameAccountId(value);
    }

    private _updateCurrentGameAccountId(accountId: string) {
        if (accountId === this.state.currentGameAccountId) {
            return;
        }
        this.setState({
            currentGameAccountId: accountId
        });
    }

    private _handleCurrentGameAccountChange(account: Nullable<UserGameAccount>) {
        const accountId = account?._id || '';
        this._updateCurrentGameAccountId(accountId);
    }

    private _handleGameAccountListUpdated(accounts: ReadonlyPartialArray<UserGameAccount>) {
        this.setState({
            gameAccountList: accounts
        });
    }

});
