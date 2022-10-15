import { Nullable } from '@fgo-planner/common-core';
import { ImmutableMasterAccount } from '@fgo-planner/data-core';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';

const AccountIdParam = 'account-id';

const Path = 'settings';

export const MasterSettingsRoute = React.memo(() => {

    const [searchParams] = useSearchParams();
    const accountIdParam = searchParams.get(AccountIdParam);
    
    const masterAccountService = useInjectable(MasterAccountService);
    
    /**
     * Whether the initialization routine for the component has been completed. 
     */
    const [initialized, setInitialized] = useState(false);

    const [masterAccount, setMasterAccount] = useState<Nullable<ImmutableMasterAccount>>();

    /**
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /**
     * Component initialization routine.
     *
     * This will check whether an `account-id` query param was provided in the URL.
     * If it was, then activate the master account with the corresponding ID, and
     * then remove the query params from the URL.
     */
    useEffect(() => {
        if (initialized) {
            return;
        }
        if (!accountIdParam) {
            setInitialized(true);
        } else {
            console.log('Account ID', accountIdParam);
            const initialize = async () => {
                await masterAccountService.selectAccount(accountIdParam);
                window.history.replaceState(window.history.state, '', Path);
                setInitialized(true);
            };
            initialize();
        }
    }, [accountIdParam, initialized, masterAccountService]);

    if (!initialized || !masterAccount) {
        return null;
    }

    // TODO Implement the rest of this component

    return <>
        <PageTitle>
            Master Account Settings
        </PageTitle>
    </>;

});
