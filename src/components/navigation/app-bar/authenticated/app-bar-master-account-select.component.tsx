import { MasterAccount } from '@fgo-planner/types';
import { MenuItem, TextField } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import { ChangeEvent, CSSProperties, PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { Nullable, ReadonlyPartialArray } from '../../../../types/internal';

type Props = {
    masterAccountList: ReadonlyPartialArray<MasterAccount>;
};

type State = {
    currentMasterAccountId: string;
};

const StyleClassPrefix = 'master-account-select';

const styles = {
    width: 224,
    bgcolor: 'background.default'
} as SystemStyleObject<Theme>;

const selectOptionStyles = {
    height: 40
} as CSSProperties;

export const AppBarMasterAccountSelect = class extends PureComponent<Props, State> {

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
        this._onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(this._handleCurrentMasterAccountChange.bind(this));
    }

    componentWillUnmount(): void {
        this._onCurrentMasterAccountChangeSubscription.unsubscribe();
    }

    render(): ReactNode {
        const { masterAccountList } = this.props;
        const { currentMasterAccountId } = this.state;
        return (
            <TextField
                select
                variant="outlined"
                size="small"
                className={StyleClassPrefix}
                sx={styles}
                value={currentMasterAccountId}
                onChange={this._handleInputChange}
            >
                {masterAccountList.map(this._renderSelectOption)}
            </TextField>
        );
    }

    private _renderSelectOption(account: Partial<MasterAccount>, index: number): ReactNode {
        let itemLabel = account.name || `Account ${index + 1}`;
        if (account.friendId) {
            itemLabel += ` (${account.friendId})`;
        }
        return (
            <MenuItem
                style={selectOptionStyles}
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
        MasterAccountService.selectAccount(accountId);
    }

    private _handleCurrentMasterAccountChange(account: Nullable<MasterAccount>): void {
        const accountId = account?._id || '';
        this.setState({
            currentMasterAccountId: accountId
        });
    }

};
