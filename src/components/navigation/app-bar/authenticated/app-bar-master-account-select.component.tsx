import { MenuItem, StyleRules, TextField, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ChangeEvent, PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { Container as Injectables } from 'typedi';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { MasterAccount, Nullable, ReadonlyPartialArray, WithStylesProps } from '../../../../types';

type Props = {
    masterAccountList: ReadonlyPartialArray<MasterAccount>;
} & WithStylesProps;

type State = {
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

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'AppBarMasterAccountSelect'
};

export const AppBarMasterAccountSelect = withStyles(style, styleOptions)(class extends PureComponent<Props, State> {

    private _masterAccountService = Injectables.get(MasterAccountService);

    private _onCurrentMasterAccountChangeSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            currentMasterAccountId: ''
        };

        this._renderSelectOption = this._renderSelectOption.bind(this);
        this._handleInputChange = this._handleInputChange.bind(this);
    }

    componentDidMount(): void {
        this._onCurrentMasterAccountChangeSubscription = this._masterAccountService.onCurrentMasterAccountChange
            .subscribe(this._handleCurrentMasterAccountChange.bind(this));
    }

    componentWillUnmount(): void {
        this._onCurrentMasterAccountChangeSubscription.unsubscribe();
    }

    render(): ReactNode {
        const { classes, masterAccountList } = this.props;
        const { currentMasterAccountId } = this.state;
        return (
            <TextField
                select
                variant="outlined"
                size="small"
                className={classes.root}
                value={currentMasterAccountId}
                onChange={this._handleInputChange}
            >
                {masterAccountList.map(this._renderSelectOption)}
            </TextField>
        );
    }

    private _renderSelectOption(account: Partial<MasterAccount>, index: number): ReactNode {
        const { classes } = this.props;
        let itemLabel = account.name || `Account ${index + 1}`;
        if (account.friendId) {
            itemLabel += ` (${account.friendId})`;
        }
        return (
            <MenuItem
                className={classes.selectOption}
                value={account._id}
                key={index}
            >
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

    private _handleCurrentMasterAccountChange(account: Nullable<MasterAccount>): void {
        const accountId = account?._id || '';
        this.setState({
            currentMasterAccountId: accountId
        });
    }

});
