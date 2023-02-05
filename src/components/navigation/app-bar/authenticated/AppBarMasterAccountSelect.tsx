import { Nullable } from '@fgo-planner/common-core';
import { ImmutableBasicMasterAccount, MasterAccount } from '@fgo-planner/data-core';
import { MenuItem, TextField, Theme } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ChangeEvent, CSSProperties, ReactNode, useCallback, useEffect, useState } from 'react';
import { useInjectable } from '../../../../hooks/dependency-injection/useInjectable';
import { MasterAccountService } from '../../../../services/data/master/MasterAccountService';
import { BasicMasterAccounts } from '../../../../types';
import { SubscribablesContainer } from '../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../utils/subscription/SubscriptionTopics';

type Props = {
    masterAccountList: BasicMasterAccounts;
};

const StyleClassPrefix = 'AppBarMasterAccountSelect';

const StyleProps = (theme: SystemTheme) => {

    const {
        palette,
        spacing
    } = theme as Theme;

    return {
        width: spacing(56),  // 224px
        '& .MuiOutlinedInput-root': {
            backgroundColor: palette.background.paper
        }
    } as SystemStyleObject<SystemTheme>;
};

const SelectOptionStyle = {
    height: 40
} as CSSProperties;

export const AppBarMasterAccountSelect = React.memo(({ masterAccountList }: Props) => {

    const masterAccountService = useInjectable(MasterAccountService);

    const [currentMasterAccountId, setCurrentMasterAccountId] = useState<string>('');

    /**
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe((masterAccount: Nullable<MasterAccount>) => {
                setCurrentMasterAccountId(masterAccount?._id || '');
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const accountId = event.target.value;
        setCurrentMasterAccountId((currentMasterAccountId: string): string => {
            if (accountId !== currentMasterAccountId) {
                /**
                 * Set timeout is not needed here because the `selectAccount` method is already
                 * async (?).
                 */
                masterAccountService.selectAccount(accountId);
            }
            return accountId;
        });
    }, [masterAccountService]);

    const renderSelectOption = (account: ImmutableBasicMasterAccount, index: number): ReactNode => {
        let itemLabel = account.name || `Account ${index + 1}`;
        if (account.friendId) {
            itemLabel += ` (${account.friendId})`;
        }
        return (
            <MenuItem
                style={SelectOptionStyle}
                value={account._id}
                key={index}
            >
                {itemLabel}
            </MenuItem>
        );
    };

    // TODO Return a native select if on a mobile device.
    return (
        <TextField
            select
            variant='outlined'
            size='small'
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            value={currentMasterAccountId}
            onChange={handleInputChange}
        >
            {masterAccountList.map(renderSelectOption)}
        </TextField>
    );

});
