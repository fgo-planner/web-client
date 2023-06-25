import { Immutable, Nullable } from '@fgo-planner/common-core';
import { MasterAccount } from '@fgo-planner/data-core';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { Fragment, ReactNode, useEffect, useMemo, useState } from 'react';
import { MasterAccountFriendId } from '../../components/master/account/MasterAccountFriendId';
import { AppBarElevateOnScroll } from '../../components/navigation/app-bar/AppBarElevateOnScroll';
import { SubscribablesContainer } from '../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../utils/subscription/SubscriptionTopics';
import { HomeRouteLink } from './components/HomeRouteLink';
import { HomeRouteLinkSection } from './components/HomeRouteLinkSection';

const StyleProps = {
    py: 4,
    height: '100%',
    overflowY: 'auto'
} as SystemStyleObject<Theme>;

const StyleClassPrefix = 'HomeRoute';

export const HomeRoute = React.memo(() => {

    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /**
     * Resource links that are displayed regardless of whether the user is logged in
     * or not.
     */
    const commonResourcesLinkNodes = useMemo((): Array<ReactNode> => {
        return [
            <HomeRouteLink
                key='servants'
                title='Servants'
                to='resources/servants'
                imageUrl='https://static.atlasacademy.io/JP/Faces/f_1001003.png'
            />,
            <HomeRouteLink
                key='items'
                title='Items'
                to='resources/items'
                imageUrl='https://static.atlasacademy.io/JP/Faces/f_2002003.png'
            />,
            <HomeRouteLink
                key='events'
                title='Events'
                to='resources/events'
                imageUrl='https://static.atlasacademy.io/JP/Faces/f_94035200.png'
            />,
            <HomeRouteLink
                key='about'
                title='About'
                to='about'
                imageUrl='https://static.atlasacademy.io/JP/Faces/f_93053100.png'
            />
        ];
    }, []);

    const masterAccountLabel = useMemo((): ReactNode => {
        let label: ReactNode = null;
        if (masterAccount) {
            if (masterAccount.name) {
                label = masterAccount.name;
            } else if (masterAccount.friendId) {
                label = <MasterAccountFriendId masterAccount={masterAccount} />;
            }
        }
        if (label) {
            return <>Master Account - {label}</>;
        }
        return <>Master Account</>;
    }, [masterAccount]);

    /**
     * Links specific to the currently selected master account. Only displayed when
     * the user is logged in and they have a master account.
     */
    const masterAccountLinksNode = useMemo((): ReactNode => {
        return (
            <HomeRouteLinkSection title={masterAccountLabel}>
                <HomeRouteLink
                    title='Dashboard'
                    to='user/master'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93026000.png'
                />
                <HomeRouteLink
                    title='Servant Roster'
                    to='user/master/servants'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93049300.png'
                />
                <HomeRouteLink
                    title='Inventory'
                    to='user/master/items'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_98073400.png'
                />
                <HomeRouteLink
                    title='Costumes'
                    to='user/master/costumes'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93048800.png'
                />
                <HomeRouteLink
                    title='Soundtracks'
                    to='user/master/soundtracks'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_98057800.png'
                />
                <HomeRouteLink
                    title='Planner'
                    to='user/master/planner'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93047300.png'
                />
            </HomeRouteLinkSection>
        );
    }, [masterAccountLabel]);

    const userAccountLinksNode = useMemo((): ReactNode => {
        return (
            <HomeRouteLinkSection title='User Account'>
                <HomeRouteLink
                    title='Master Accounts'
                    to='user/master-accounts'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93043800.png'
                />
                <HomeRouteLink
                    title='User Settings'
                    to='user/settings'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93009400.png'
                />
            </HomeRouteLinkSection>
        );
    }, []);

    const linksNode = useMemo((): ReactNode => {
        if (!masterAccount) {
            return (
                <HomeRouteLinkSection>
                    {commonResourcesLinkNodes}
                    <HomeRouteLink
                        key='login'
                        title='Login'
                        // TODO Open login modal instead of redirecting to login page.
                        to='login'
                        imageUrl='https://static.atlasacademy.io/JP/Faces/f_94003400.png'
                    />
                </HomeRouteLinkSection>
            );
        } else {
            return (
                <Fragment>
                    {/* TODO Hide master account links if user doesn't have a master account. */}
                    {masterAccountLinksNode}
                    {userAccountLinksNode}
                    <HomeRouteLinkSection title='Resources'>
                        {commonResourcesLinkNodes}
                    </HomeRouteLinkSection>
                </Fragment>
            );
        }
    }, [commonResourcesLinkNodes, masterAccount, masterAccountLinksNode, userAccountLinksNode]);

    return (
        <AppBarElevateOnScroll className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {linksNode}
        </AppBarElevateOnScroll>
    );
});
