import { MenuItem, StyleRules, TextField, Theme, withStyles } from '@material-ui/core';
import { MasterAccount } from 'data';
import { Nullable, ReadonlyPartialArray, WithStylesProps } from 'internal';
import React, { ChangeEvent, PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { MasterAccountService } from 'services';
import { Container as Injectables } from 'typedi';

type Props = WithStylesProps;

type State = {
    masterAccountList: ReadonlyPartialArray<MasterAccount>;
    currentMasterAccountId: string;
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

export const AppBarMasterAccountSelect = withStyles(style)(class extends PureComponent<Props, State> {

    private _masterAccountService = Injectables.get(MasterAccountService);

    private _onCurrentMasterAccountChangeSubscription!: Subscription;

    private _onMasterAccountListUpdatedSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            masterAccountList: [],
            currentMasterAccountId: ''
        };
        this._renderSelectOption = this._renderSelectOption.bind(this);
        this._handleInputChange = this._handleInputChange.bind(this);
    }

    componentDidMount() {
        this._onCurrentMasterAccountChangeSubscription = this._masterAccountService.onCurrentMasterAccountChange
            .subscribe(this._handleCurrentMasterAccountChange.bind(this));
        this._onMasterAccountListUpdatedSubscription = this._masterAccountService.onMasterAccountListUpdated
            .subscribe(this._handleMasterAccountListUpdated.bind(this));
    }

    componentWillUnmount() {
        this._onCurrentMasterAccountChangeSubscription.unsubscribe();
        this._onMasterAccountListUpdatedSubscription.unsubscribe();
    }

    render(): ReactNode {
        return (
            <TextField select 
                       variant="outlined"
                       size="small"
                       className={this.props.classes.root}
                       value={this.state.currentMasterAccountId}
                       onChange={this._handleInputChange}>
                 {this.state.masterAccountList.map(this._renderSelectOption)}
            </TextField>
        );
    }

    private _renderSelectOption(account: Partial<MasterAccount>, index: number): ReactNode {
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
        const accountId = event.target.value;
        if (accountId === this.state.currentMasterAccountId) {
            return;
        }
        this.setState({
            currentMasterAccountId: accountId
        });
        this._masterAccountService.selectAccount(accountId);
    }

    private _handleCurrentMasterAccountChange(account: Nullable<MasterAccount>) {
        const accountId = account?._id || '';
        this.setState({
            currentMasterAccountId: accountId
        });
    }

    private _handleMasterAccountListUpdated(accounts: ReadonlyPartialArray<MasterAccount>) {
        this.setState({
            masterAccountList: accounts
        });
    }

});
