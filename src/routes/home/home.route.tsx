import { MasterAccount } from '@fgo-planner/types';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { Fragment, ReactNode, useEffect, useMemo, useState } from 'react';
import { useElevateAppBarOnScroll } from '../../hooks/user-interface/use-elevate-app-bar-on-scroll.hook';
import { Immutable, Nullable } from '../../types/internal';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../utils/subscription/subscription-topic';
import { HomeLinkSection } from './home-link-section.component';
import { HomeLink } from './home-link.component';

const StyleProps = {
    py: 4,
    height: '100%',
    overflowY: 'auto'
} as SystemStyleObject<Theme>;

const StyleClassPrefix = 'Home';

export const HomeRoute = React.memo(() => {

    const scrollContainerRef = useElevateAppBarOnScroll();

    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopic.User_CurrentMasterAccountChange)
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /**
     * Resource links that are displayed regardless of whether the user is logged in
     * or not.
     */
    const commonResourcesLinkNodes = useMemo((): Array<ReactNode> => {
        return [
            <HomeLink
                key='servants'
                title='Servants'
                to='resources/servants'
                imageUrl='https://static.atlasacademy.io/JP/Faces/f_1001003.png'
            />,
            <HomeLink
                key='items'
                title='Items'
                to='resources/items'
                imageUrl='https://static.atlasacademy.io/JP/Faces/f_2002003.png'
            />,
            <HomeLink
                key='events'
                title='Events'
                to='resources/events'
                imageUrl='https://static.atlasacademy.io/JP/Faces/f_94035200.png'
            />,
            <HomeLink
                key='about'
                title='About'
                to='about'
                imageUrl='https://static.atlasacademy.io/JP/Faces/f_93053100.png'
            />
        ];
    }, []);

    /**
     * Links specific to the currently selected master account. Only displayed when
     * the user is logged in and they have a master account.
     */
    const masterAccountLinksNode = useMemo((): ReactNode => {
        return (
            <HomeLinkSection title='Master Account'>
                <HomeLink
                    title='Dashboard'
                    to='user/master'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93026000.png'
                />
                <HomeLink
                    title='My Servants'
                    to='user/master/servants'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93049300.png'
                />
                <HomeLink
                    title='My Inventory'
                    to='user/master/items'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_98073400.png'
                />
                <HomeLink
                    title='My Costumes'
                    to='user/master/servants/costumes'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93048800.png'
                />
                <HomeLink
                    title='My Soundtracks'
                    to='user/master/soundtracks'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_98057800.png'
                />
                <HomeLink
                    title='Planner'
                    to='user/master/planner'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93047300.png'
                />
            </HomeLinkSection>
        );
    }, []);

    const userAccountLinksNode = useMemo((): ReactNode => {
        return (
            <HomeLinkSection title='User Account'>
                <HomeLink
                    title='Master Accounts'
                    to='user/master-accounts'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93043800.png'
                />
                <HomeLink
                    title='Settings'
                    to='user/settings'
                    imageUrl='https://static.atlasacademy.io/JP/Faces/f_93009400.png'
                />
            </HomeLinkSection>
        );
    }, []);

    const linksNode = useMemo((): ReactNode => {
        if (!masterAccount) {
            return (
                <HomeLinkSection>
                    {commonResourcesLinkNodes}
                    <HomeLink
                        key='login'
                        title='Login'
                        // TODO Open login modal instead of redirecting to login page.
                        to='login'
                        imageUrl='https://static.atlasacademy.io/JP/Faces/f_94003400.png'
                    />
                </HomeLinkSection>
            );
        } else {
            return (
                <Fragment>
                    {/* TODO Hide master account links if user doesn't have a master account. */}
                    {masterAccountLinksNode}
                    {userAccountLinksNode}
                    <HomeLinkSection title='Resources'>
                        {commonResourcesLinkNodes}
                    </HomeLinkSection>
                </Fragment>
            );
        }
    }, [commonResourcesLinkNodes, masterAccount, masterAccountLinksNode, userAccountLinksNode]);

    return (
        <Box
            ref={scrollContainerRef}
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
        >
            {linksNode}
        </Box>
    );
});