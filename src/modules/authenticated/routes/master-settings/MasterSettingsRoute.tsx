import { Immutable, Nullable } from '@fgo-planner/common-core';
import { MasterAccount } from '@fgo-planner/data-core';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTitle } from '../../../../components/text/PageTitle';
import { useInjectable } from '../../../../hooks/dependency-injection/useInjectable';
import { MasterAccountService } from '../../../../services/data/master/MasterAccountService';
import { SubscribablesContainer } from '../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../utils/subscription/SubscriptionTopics';

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

    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();

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



    return <>
        <PageTitle>
            Master Account Settings
        </PageTitle>
    </>;

});
