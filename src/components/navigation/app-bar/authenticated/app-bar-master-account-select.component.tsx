import { MasterAccount } from '@fgo-planner/types';
import { MenuItem, TextField } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import { ChangeEvent, CSSProperties, PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { MasterAccountList } from '../../../../types/data';
import { Immutable, Nullable } from '../../../../types/internal';
import { InjectablesContainer } from '../../../../utils/dependency-injection/injectables-container';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';

type Props = {
    masterAccountList: MasterAccountList;
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

// TODO Convert this to functional component
export const AppBarMasterAccountSelect = class extends PureComponent<Props, State> {

    // TODO Use the useInjectable hook after converting into functional component.
    private get _masterAccountService() {
        return InjectablesContainer.get(MasterAccountService)!;
    }

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
        this._onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
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

    private _renderSelectOption(account: Immutable<Partial<MasterAccount>>, index: number): ReactNode {
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
        this._masterAccountService.selectAccount(accountId);
    }

    private _handleCurrentMasterAccountChange(account: Nullable<MasterAccount>): void {
        const accountId = account?._id || '';
        this.setState({
            currentMasterAccountId: accountId
        });
    }

};
