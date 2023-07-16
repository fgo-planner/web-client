import { Immutable, Nullable } from '@fgo-planner/common-core';
import { MasterAccount } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { NavigationDrawerContext, NavigationDrawerContextProps } from '../../../contexts/NavigationDrawerContext';
import { useInjectable } from '../../../hooks/dependency-injection/useInjectable';
import { AuthenticationService } from '../../../services/authentication/AuthenticationService';
import { UserInterfaceService } from '../../../services/user-interface/UserInterfaceService';
import { ThemeConstants } from '../../../styles/ThemeConstants';
import { NavigationDrawerContent as Content, NavigationDrawerSection as Section } from '../../../types';
import { SubscribablesContainer } from '../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../utils/subscription/SubscriptionTopics';
import { NavigationDrawerDesktop } from './NavigationDrawerDesktop';
import { NavigationDrawerMobile } from './NavigationDrawerMobile';

type Props = PropsWithChildren<{
    mobileView: boolean;
}>;

const HomeButtonSection: Section = {
    key: 'home',
    hideDivider: true,
    items: [
        {
            key: 'app-home',
            icon: 'home',
            iconVariant: 'outlined',
            activeIconVariant: 'filled',
            label: 'Home',
            route: '/',
            exact: true
        }
    ]
};

const MasterAccountRoutesSection: Section = {
    key: 'master-account',
    items: [
        {
            key: 'account-dashboard',
            icon: 'dashboard',
            iconVariant: 'outlined',
            activeIconVariant: 'filled',
            label: 'Dashboard',
            route: '/user/master/dashboard',
            exact: true
        },
        {
            key: 'account-planner',
            icon: 'calendar_month',
            iconVariant: 'outlined',
            activeIconVariant: 'filled',
            label: 'Planner',
            route: '/user/master/planner'
        },
        {
            key: 'account-servants',
            icon: 'people_alt',
            iconVariant: 'outlined',
            activeIconVariant: 'filled',
            label: 'Roster',
            tooltip: 'Servant Roster',
            route: '/user/master/servants'
        },
        {
            key: 'account-items',
            icon: 'business_center',
            iconVariant: 'outlined',
            activeIconVariant: 'filled',
            label: 'Inventory',
            route: '/user/master/items'
        },
        {
            key: 'account-costumes',
            icon: 'theater_comedy',
            iconVariant: 'outlined',
            activeIconVariant: 'filled',
            label: 'Costumes',
            route: '/user/master/costumes'
        },
        {
            key: 'account-soundtracks',
            icon: 'music_note',
            iconVariant: 'outlined',
            activeIconVariant: 'filled',
            label: 'Soundtracks',
            route: '/user/master/soundtracks'
        }
    ]
};

const ResourceRoutesSection: Section = {
    key: 'resources',
    items: [
        {
            key: 'servants',
            icon: 'group',
            iconVariant: 'outlined',
            activeIconVariant: 'filled',
            label: 'Servants',
            route: '/resources/servants'
        },
        {
            key: 'items',
            icon: 'category',
            iconVariant: 'outlined',
            activeIconVariant: 'filled',
            label: 'Items',
            route: '/resources/items'
        },
        {
            key: 'events',
            icon: 'stadium',
            iconVariant: 'outlined',
            activeIconVariant: 'filled',
            label: 'Events',
            route: '/resources/events'
        }
    ]
};

const StyleClassPrefix = 'NavigationDrawerContainer';

const StyleProps = (theme: SystemTheme) => {

    const { spacing } = theme as Theme;

    return {
        display: 'flex',
        height: '100%',
        '& .MuiDrawer-root>.MuiPaper-root': {
            /**
             * Condensed app bar scaling is not needed because these rules only apply to
             * desktop screen widths, where condensed app bar is never displayed.
             */
            top: spacing(ThemeConstants.AppBarHeightScale),
            height: `calc(100% - ${spacing(ThemeConstants.AppBarHeightScale)})`
        },
        [`& .${StyleClassPrefix}-children`]: {
            display: 'flex', // This is needed to correctly display app bar shadow
            flexDirection: 'column',
            flex: 1,
            height: '100%',
            overflow: 'hidden' // Prevents app bar shadow from bleeding over to the drawer
        }
    } as SystemStyleObject<SystemTheme>;
};

export const NavigationDrawerContainer = React.memo((props: Props) => {

    const {
        mobileView,
        children
    } = props;

    const authenticationService = useInjectable(AuthenticationService);
    const userInterfaceService = useInjectable(UserInterfaceService);

    const [open, setOpen] = useState<boolean>(false);
    const [animationsDisabled, setAnimationsDisabled] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();

    /**
     * User change subscription.
     */
    useEffect(() => {
        const onCurrentUserChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentUserChange)
            .subscribe(user => {
                setIsLoggedIn(!!user);
            });

        return () => onCurrentUserChangeSubscription.unsubscribe();
    }, []);

    /**
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /*
     * Navigation drawer open state change subscription
     */
    useEffect(() => {
        const onNavigationDrawerOpenChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.NavigationDrawerOpenChange)
            .subscribe(setOpen);

        return () => onNavigationDrawerOpenChangeSubscription.unsubscribe();
    }, []);

    /*
     * Navigation drawer no animations change subscription
     */
    useEffect(() => {
        const onNavigationDrawerNoAnimationsChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.NavigationDrawerNoAnimationsChange)
            .subscribe(setAnimationsDisabled);

        return () => onNavigationDrawerNoAnimationsChangeSubscription.unsubscribe();
    }, []);

    const handleDrawerClose = useCallback((): void => {
        userInterfaceService.setNavigationDrawerOpen(false);
    }, [userInterfaceService]);

    const contextValue = useMemo((): NavigationDrawerContextProps => ({
        animationsDisabled,
        expanded: mobileView || open, // Contents are always displayed in expanded mode in mobile view.
        mobileView,
        onClose: handleDrawerClose,
        open
    }), [animationsDisabled, handleDrawerClose, mobileView, open]);

    const hasActiveMasterAccount = !!masterAccount;
    const content = useMemo((): Content => {
        const sections = [] as Array<Section>;
        /**
         * Add master account routes only if there is an active master account.
         */
        if (hasActiveMasterAccount) {
            sections.push(MasterAccountRoutesSection);
        }
        /**
         * Add resources route regardless if whether user is logged in.
         */
        sections.push(ResourceRoutesSection);
        /**
         * Add login/logout button depending on whether user is logged in.
         */
        if (isLoggedIn) {
            sections.push({
                key: 'logout',
                items: [
                    {
                        key: 'user-settings',
                        icon: 'settings',
                        iconVariant: 'outlined',
                        activeIconVariant: 'filled',
                        label: 'Settings',
                        route: '/user/settings'
                    },
                    {
                        key: 'logout',
                        icon: 'logout',
                        label: 'Log Out',
                        onClick: () => void authenticationService.logout()
                    }
                ]
            });
        } else {
            sections.unshift({
                key: 'login',
                items: [
                    {
                        key: 'login',
                        icon: 'login',
                        label: 'Log In',
                        route: '/login',
                        onClick: () => userInterfaceService.openLoginDialog()
                    }
                ]
            });
        }
        /**
         * Add home button to the top of the list.
         */
        sections.unshift(HomeButtonSection);
        return { sections };
    }, [authenticationService, hasActiveMasterAccount, isLoggedIn, userInterfaceService]);

    const drawerNode = mobileView ?
        <NavigationDrawerMobile content={content} /> :
        <NavigationDrawerDesktop content={content} />;

    return (
        <NavigationDrawerContext.Provider value={contextValue}>
            <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
                {drawerNode}
                <div className={`${StyleClassPrefix}-children`}>
                    {children}
                </div>
            </Box>
        </NavigationDrawerContext.Provider>
    );

});
